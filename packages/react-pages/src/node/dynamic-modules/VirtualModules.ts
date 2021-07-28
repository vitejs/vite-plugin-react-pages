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
   * Before executing an updater, it will automatically clean the effects of
   * previous update with same updaterId. This will be convenience for users,
   * because they don't need to manually clean the previous effects of a file
   * when a file updates.
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
    setTimeout(() => {
      this.executeUpdates()
    }, 0)
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

  private executing = false
  private async executeUpdates() {
    if (this.executing) return
    // record the updatedModules so that we can call moduleUpdateListeners in the end
    // only virtule modules can be updated and recorded
    const updatedModules = new Set<Module>()
    this.executing = true
    while (true) {
      const update = this.updateQueue.pop()
      if (!update) break
      this.cleanUpdateEffects(update.updaterId)
      const { disableAPIs, ...apis } = this.createUpdateAPIs(
        update.updaterId,
        updatedModules
      )
      await update.updater(apis)
      disableAPIs()
    }
    this.executing = false
    this.callModuleUpdateListeners(updatedModules)
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
        // It should be noted that the moduleId and upstreamModuleId
        // may be real files in fs
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
        module.unlink()
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

  private cleanUpdateEffects(updaterId: string) {
    deleteAllEdgesWithUpdaterId(updaterId)
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
  public unlink() {
    this.data.forEach((edge) => {
      edge.unlink()
    })
    this.downstream.forEach((edge) => {
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
function deleteAllEdgesWithUpdaterId(updaterId: string) {
  const edges = mapUpdaterIdToEdges.get(updaterId)
  if (!edges) return
  edges.forEach((edge) => {
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
