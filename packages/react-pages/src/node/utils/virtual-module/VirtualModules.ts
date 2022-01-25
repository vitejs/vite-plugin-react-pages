import { PendingState } from './utils'

export class VirtualModuleGraph {
  /**
   * the module inside this graph may be virtual module or real fs module
   */
  private readonly modules: Map<string, Module> = new Map()

  /**
   * Serialize the update works (instead of doing them concurrently)
   * to make the result more predictable.
   *
   * If there is already a queuing update with same updaterId,
   * it won't schedule a new one.
   *
   * Before executing an updater, it will automatically cleanup the effects of
   * previous update with same updaterId.
   * Example:
   * When find module1 for the first time:
   *   the updater set data for module2 and module3 (upstreamModule is module1)
   * Then, when observe that module1 is updated:
   *   the updater set data for module2 (upstreamModule is module1)
   * At this time, the data in module3 should be automatically cleanup!
   * So the updater(users) don't need to manually delete the old data in module3.
   */
  private updateQueue = new UpdateQueue()
  /** track updateQueue empty state (isPending means not empty) */
  public updateQueueEmptyState = new PendingState()

  public getModuleIds(filter?: (moduleId: string) => boolean): string[] {
    const ids = Array.from(this.modules.keys())
    if (filter) return ids.filter(filter)
    return ids
  }

  public getModuleData(moduleId: string): any[] {
    const module = this.modules.get(moduleId)
    if (!module) return []
    return module.getData()
  }

  public getModules(filter?: (moduleId: string) => boolean) {
    let entries = Array.from(this.modules.entries())
    // filter is a performance optimization:
    // don't call module.getData() for filtered-out modules
    if (filter) entries = entries.filter(([moduleId]) => filter(moduleId))
    const modules: { [id: string]: any[] } = {}
    entries.forEach(([moduleId, module]) => {
      modules[moduleId] = module.getData()
    })
    return modules
  }

  /**
   * This is the only way to update virtual modules
   */
  public scheduleUpdate(updaterId: string, updater: Update['updater']) {
    this.updateQueue.push(updaterId, updater)
    this.updateQueueEmptyState.isPending = true
    // don't schedule setTimeout if there is already one
    if (this.updateQueue.size === 1) {
      setTimeout(() => {
        this.executeUpdates()
      }, 0)
    }
  }

  public addModuleListener(
    handler: ModuleListener,
    filter?: (moduleId: string) => boolean
  ) {
    return this._addModuleListener((moduleId, data, prevData) => {
      if (filter && !filter(moduleId)) return
      handler(moduleId, data, prevData)
    })
  }
  /**
   * listen to virtual module updates.
   * users can scheduleUpdate in these listeners, creating dependency chain of
   * virtual modules.
   * (.i.e when a virtual module changes, it will update another virtual module)
   *
   * users will reveive new module data and previous module data,
   * so users can diff them to decide whether the module has "really" changed.
   * if users think they are the same, the can skip updating other virtual modules.
   * VirtualModuleGraph works on a very low level. It don't know what module data means. So it send updates event to users very often and let users to interpret module data.
   *
   * @return unsubscribe function
   */
  private _addModuleListener(cb: ModuleListener) {
    this.moduleUpdateListeners.push(cb)
    return () => {
      const index = this.moduleUpdateListeners.indexOf(cb)
      if (index === -1) return
      this.moduleUpdateListeners.splice(index, 1)
    }
  }
  private moduleUpdateListeners: ModuleListener[] = []
  private callModuleUpdateListeners(
    updatedModules: Map<Module, { prevData: any[] }>
  ) {
    updatedModules.forEach(({ prevData }, module) => {
      const data = module.getData()
      this.moduleUpdateListeners.forEach((moduleUpdateListener) => {
        moduleUpdateListener(module.id, data, prevData)
      })
    })
  }

  // executeUpdates_Inner is not reentrant
  // use a state(lock) to prevent concurrent execution
  public updateExecutingState = new PendingState()
  private async executeUpdates() {
    if (this.updateExecutingState.isPending) return
    this.updateExecutingState.isPending = true
    try {
      await this.executeUpdates_Inner()
    } finally {
      this.updateExecutingState.isPending = false
      if (this.updateQueue.size === 0)
        this.updateQueueEmptyState.isPending = false
    }
  }
  private async executeUpdates_Inner(depth = 1) {
    if (this.updateQueue.size === 0) return
    if (depth > MAX_CASCADE_UPDATE_DEPTH)
      throw new Error(
        `Cascaded updates exceed max depth ${MAX_CASCADE_UPDATE_DEPTH}. Probably because the depth of the virtual module tree is too high, or there is a cycle in the virtual module graph.`
      )

    // record the updatedModules so that we can notify listeners in the end
    // also store prevData so users can diff it with new data
    const updatedModules = new Map<Module, { prevData: any[] }>()
    /** it must be called before updating data so that it can record prevData */
    const recordAffectedModule = (module: Module) => {
      if (updatedModules.has(module)) return
      updatedModules.set(module, { prevData: module.getData() })
    }

    while (true) {
      const update = this.updateQueue.pop()
      if (!update) break
      // cleanup the effects of previous update with same updaterId
      cleanupEdgesWithUpdaterId(update.updaterId, recordAffectedModule)
      const { disableAPIs, ...apis } = this.createUpdateAPIs(
        update.updaterId,
        recordAffectedModule
      )
      await update.updater(apis)
      disableAPIs()
    }
    this.callModuleUpdateListeners(updatedModules)
    // if the listeners schedule more updates,
    // execute them synchronously and recursively
    await this.executeUpdates_Inner(depth + 1)
  }

  private createUpdateAPIs(
    updaterId: string,
    recordAffectedModule: (module: Module) => void
  ): VirtualModuleAPIs & { disableAPIs(): void } {
    let outdated = false
    const _this = this
    const OUTDATED_ERROR_MSG = `You should not call update APIs after the updater async function.`
    return {
      addModuleData(moduleId: string, data: any, upstreamModuleId: string) {
        if (outdated) throw new Error(OUTDATED_ERROR_MSG)
        if (moduleId === upstreamModuleId)
          throw new Error(
            `addModuleData param error: source and target modules are the same`
          )
        // upstreamModuleId may be real file in fs
        const fromModule = _this.ensureModule(upstreamModuleId)
        const toModule = _this.ensureModule(moduleId)
        recordAffectedModule(toModule)
        Edge.addEdge(fromModule, toModule, data, updaterId)
      },
      getModuleData(moduleId: string) {
        if (outdated) throw new Error(OUTDATED_ERROR_MSG)
        return _this.getModuleData(moduleId)
      },
      deleteModule(moduleId: string) {
        if (outdated) throw new Error(OUTDATED_ERROR_MSG)
        const module = _this.modules.get(moduleId)
        if (!module) return
        module.delete(recordAffectedModule)
        _this.modules.delete(moduleId)
      },
      disableAPIs() {
        outdated = true
      },
    }
  }

  private ensureModule(moduleId: string): Module {
    let result = this.modules.get(moduleId)
    if (!result) {
      result = new Module(moduleId)
      this.modules.set(moduleId, result)
    }
    return result
  }
}

export type ModuleListener = (
  moduleId: string,
  data: any[],
  prevData: any[]
) => void

/**
 * Modules are nodes in the graph
 */
class Module {
  constructor(public id: string) {}

  public getData() {
    return Array.from(this.data).map(({ data }) => data)
  }

  /** unlink this module */
  public delete(recordAffectedModule: (module: Module) => void) {
    if (this.data.size > 0) {
      // there are upstream modules that are "piping" data to this module
      throw new Error(
        `This module has upstream modules. You should delete modules in topological order. moduleID: ${this.id}`
      )
    }
    recordAffectedModule(this)
    this.downstream.forEach((edge) => {
      recordAffectedModule(edge.to)
      edge.unlink()
    })
  }

  /**
   * incoming edges of the node
   * indicating the data of this virtual module
   *
   * real fs module won't need this
   */
  private data: Set<Edge> = new Set()

  /**
   * outcoming edges of the node
   * indicating which modules depend on this module
   *
   * it is needed because we need to update downstream modules
   * when a fs module is deleted
   */
  private downstream: Set<Edge> = new Set()
}
interface ModuleInternal {
  data: Set<Edge>
  downstream: Set<Edge>
}

class Edge {
  static addEdge(from: Module, to: Module, data: any, updaterId: string) {
    const edge = new Edge(from, to, data, updaterId)
    // set private fields of modules
    ;(from as unknown as ModuleInternal).downstream.add(edge)
    ;(to as unknown as ModuleInternal).data.add(edge)
    bindEdgeWithUpdaterId(edge)
  }

  private constructor(
    public from: Module,
    public to: Module,
    public data: any,
    public updaterId: string
  ) {}

  private hasUnlinked = false
  public unlink() {
    if (this.hasUnlinked) {
      return
    }
    // set private fields of modules
    ;(this.from as unknown as ModuleInternal).downstream.delete(this)
    ;(this.to as unknown as ModuleInternal).data.delete(this)
    unbindEdgeWithUpdaterId(this)
    this.hasUnlinked = true
  }
}

const mapUpdaterIdToEdges = new Map<string, Set<Edge>>()
function bindEdgeWithUpdaterId(edge: Edge) {
  const { updaterId } = edge
  let edges = mapUpdaterIdToEdges.get(updaterId)
  if (!edges) {
    edges = new Set()
    mapUpdaterIdToEdges.set(updaterId, edges)
  }
  edges.add(edge)
}
function unbindEdgeWithUpdaterId(edge: Edge) {
  const { updaterId } = edge
  const edges = mapUpdaterIdToEdges.get(updaterId)
  if (!edges || !edges.has(edge))
    throw new Error(`assertion fail: unlinkEdgeWithUpdaterId`)
  edges.delete(edge)
}
function cleanupEdgesWithUpdaterId(
  updaterId: string,
  recordAffectedModule: (module: Module) => void
) {
  const edges = mapUpdaterIdToEdges.get(updaterId)
  if (!edges) return
  edges.forEach((edge) => {
    recordAffectedModule(edge.to)
    edge.unlink()
  })
  if (edges.size > 0)
    throw new Error(
      `assertion fail: all edges with updaterId should already be unlinked`
    )
  edges.clear()
}

export interface VirtualModuleAPIs {
  addModuleData(moduleId: string, data: any, upstreamModuleId: string): void
  getModuleData(moduleId: string): any[]
  deleteModule(moduleId: string): void
}

class Update {
  constructor(
    public updaterId: string,
    public updater: (apis: VirtualModuleAPIs) => void | Promise<void>
  ) {}
}

class UpdateQueue {
  private queue: Update[] = []
  private map = new Map<string, Update>()
  get size() {
    return this.queue.length
  }
  push(updaterId: string, updater: Update['updater']) {
    // ignore it if the updaterId already exists in the queue
    if (this.map.has(updaterId)) return
    const update = new Update(updaterId, updater)
    this.queue.push(update)
    this.map.set(updaterId, update)
  }
  pop() {
    const update = this.queue.shift()
    if (!update) return null
    const { updaterId } = update
    this.map.delete(updaterId)
    return update
  }
}

// it indicates the depth of virtual modules
const MAX_CASCADE_UPDATE_DEPTH = 10
