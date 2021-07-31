import type { VolatileTaskState } from './utils'

export class VirtualModuleGraph {
  /**
   * the module inside this graph may be virtule module or real fs module
   */
  private readonly modules: Map<string, Module> = new Map()

  /**
   * Serialize the update works (instead of do them concurrently)
   * to make the result more predictable.
   *
   * If there is already a queuing update with same updaterId,
   * it won't schedule a new one.
   *
   * Before executing an updater, it will automatically cleanup the effects of
   * previous update with same updaterId.
   * Example:
   * Find module1 for the first time:
   *   the updater set data for module2 and module3 (upstreamModule is module1)
   * Observe that module1 is updated:
   *   the updater set data for module2 (upstreamModule is module1)
   * At this time, the data in module3 should be automatically cleanup!
   * So the updater don't need to manually delete the old data in module3.
   */
  private updateQueue = new UpdateQueue()

  getModuleIds(): string[] {
    return Array.from(this.modules.keys()).map((moduleId) => moduleId)
  }

  getModuleData(moduleId: string): any[] {
    const module = this.modules.get(moduleId)
    if (!module) return []
    return module.getData()
  }

  scheduleUpdate(updaterId: string, updater: Update['updater']) {
    this.updateQueue.push(updaterId, updater)
    // don't schedule setTimeout if there is already one
    if (this.updateQueue.size === 1) {
      setTimeout(() => {
        this.executeUpdates()
      }, 0)
    }
  }

  private moduleUpdateListeners: ModuleUpdateListener[] = []
  /**
   * listen to virtule module updates.
   * users can scheduleUpdate in these listeners, creating dependency chain of
   * virtule modules.
   * (.i.e when a virtule module changes, it will update another virtule module)
   *
   * return unsubscribe function
   */
  subscribeModuleUpdate(cb: ModuleUpdateListener) {
    this.moduleUpdateListeners.push(cb)
    return () => {
      const index = this.moduleUpdateListeners.indexOf(cb)
      if (index === -1) return
      this.moduleUpdateListeners.splice(index, 1)
    }
  }
  private callModuleUpdateListeners(updatedModules: Set<Module>) {
    updatedModules.forEach((m) => {
      const data = m.getData()
      this.moduleUpdateListeners.forEach((moduleUpdateListener) => {
        moduleUpdateListener(m.id, data)
      })
    })
  }

  public executeState = new ExecuteState()
  // private executing = false
  // executeUpdates_Inner is not reentrant
  private async executeUpdates() {
    if (this.executeState.executing) return
    this.executeState.executing = true
    try {
      await this.executeUpdates_Inner()
    } finally {
      this.executeState.executing = false
    }
  }
  private async executeUpdates_Inner(depth = 1) {
    if (this.updateQueue.size === 0) return
    if (depth > MAX_CASCADE_UPDATE_DEPTH)
      throw new Error(
        `Cascaded updates exceed max depth ${MAX_CASCADE_UPDATE_DEPTH}. Probably because the depth of the virtule module tree is too high, or there is a cycle in the virtule module graph.`
      )

    // record the updatedModules so that we can call moduleUpdateListeners in the end
    // only virtule modules can be updated and recorded
    const updatedModules = new Set<Module>()
    while (true) {
      const update = this.updateQueue.pop()
      if (!update) break
      // cleanup the effects of previous update with same updaterId
      cleanupEdgesWithUpdaterId(update.updaterId, updatedModules)
      const { disableAPIs, ...apis } = this.createUpdateAPIs(
        update.updaterId,
        updatedModules
      )
      await update.updater(apis)
      disableAPIs()
    }
    this.callModuleUpdateListeners(updatedModules)
    // if the ModuleUpdateListeners schedule updates,
    // execute them synchronously and recursively
    await this.executeUpdates_Inner(depth + 1)
  }

  private createUpdateAPIs(
    updaterId: string,
    updatedModules: Set<Module>
  ): UpdaterAPIs & { disableAPIs(): void } {
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
        updatedModules.add(toModule)
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
        module.delete(updatedModules)
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

type ModuleUpdateListener = (moduleId: string, data: any[]) => void

/**
 * Modules are nodes in the graph
 */
class Module {
  constructor(public id: string) {}

  public getData() {
    return Array.from(this.data).map(({ data }) => data)
  }

  /** unlink this module */
  public delete(updatedModules: Set<Module>) {
    if (this.data.size > 0) {
      // there are upstream modules that are "piping" data to this module
      throw new Error(
        `This module has upstream modules. You should delete modules in topological order. moduleID: ${this.id}`
      )
    }
    this.downstream.forEach((edge) => {
      updatedModules.add(edge.to)
      edge.unlink()
    })
  }

  /**
   * incoming edges of the node
   * indicating the data of this virtule module
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
  affectedModules: Set<Module>
) {
  const edges = mapUpdaterIdToEdges.get(updaterId)
  if (!edges) return
  edges.forEach((edge) => {
    affectedModules.add(edge.to)
    edge.unlink()
  })
  if (edges.size > 0)
    throw new Error(
      `assertion fail: all edges with updaterId should already be unlinked`
    )
  edges.clear()
}

export interface UpdaterAPIs {
  addModuleData(moduleId: string, data: any, upstreamModuleId: string): void
  getModuleData(moduleId: string): any[]
  deleteModule(moduleId: string): void
}

class Update {
  constructor(
    public updaterId: string,
    public updater: (apis: UpdaterAPIs) => void
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

// it indicates the depth of virtule modules
const MAX_CASCADE_UPDATE_DEPTH = 10

class ExecuteState implements VolatileTaskState {
  private _executing = false
  get executing() {
    return this._executing
  }
  set executing(value: boolean) {
    if (this._executing === value) return
    this._executing = value
    this.cbs.forEach((cb) => cb(value))
  }

  private cbs: Array<(isBusy: boolean) => void> = []
  onStateChange(cb: (isBusy: boolean) => void) {
    this.cbs.push(cb)
    return () => {
      this.cbs = this.cbs.filter((v) => v !== cb)
    }
  }
}
