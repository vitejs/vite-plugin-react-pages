import * as fs from 'fs-extra'
import * as path from 'path'
import chokidar, { FSWatcher } from 'chokidar'
import slash from 'slash'

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
   * Before executing an updater, it will clean the effects of previous execution of same updaterId. This will be convenience for users,
   * because they don't need to manually clean the previous effects of a file
   * when a file updates.
   */
  private updateQueue = new UpdateQueue()

  getModuleData(moduleId: string): any[] {
    const module = this.modules.get(moduleId)
    if (!module) return []
    return module.getData()
  }

  scheduleUpdate(updaterId: string, updater: Update['updater']) {
    this.updateQueue.push(updaterId, updater)
  }

  watchModules() {}

  onRenderModule() {}

  onModuleUpdate() {}

  private ensureModule(
    moduleId: string,
    newModuleType: Module['moduleType']
  ): Module {
    let result = this.modules.get(moduleId)
    if (!result) {
      result = new Module(moduleId, newModuleType)
      this.modules.set(moduleId, result)
    }
    return result
  }

  private createUpdateAPIs(updaterId: string): UpdaterAPIs {
    const _this = this
    return {
      updateModule(moduleId: string, data: any, upstreamModuleId: string) {
        // fromModule must be a fs module if it doesn't exist before
        const fromModule = _this.ensureModule(upstreamModuleId, 'fs')
        // target module must be a virtule module
        const toModule = _this.ensureModule(moduleId, 'virtule')
        Edge.addEdge(fromModule, toModule, data, updaterId)
      },
      getModuleData(moduleId: string) {
        return _this.getModuleData(moduleId)
      },
      deleteFsModule(moduleId: string) {
        const module = _this.modules.get(moduleId)
        if (!module) return
        
      },
    }
  }

  private cleanUpdateEffects(updaterId: string) {
    deleteAllEdgesWithUpdaterId(updaterId)
  }
  public async executeUpdates() {
    while (true) {
      const update = this.updateQueue.pop()
      if (!update) return

      this.cleanUpdateEffects(update.updaterId)
      const apis = this.createUpdateAPIs(update.updaterId)
      await update.updater(apis)
    }
  }
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

/**
 * Module may be fs module or virtule module
 * - fs modules must not have data. But they can have downstreams.
 *    In other words, fs modules can only be data source.
 * - virtule modules can have both data and downstreams.
 *    If a virtule module doesn't have any incoming edge (.i.e data), it doesn't exists.
 */
class Module {
  constructor(public id: string, public moduleType: 'fs' | 'virtule') {}

  /** has updated, need to update it's downstream */
  // dirty: boolean

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

  /** bind incoming edge */
  public addData(edge: Edge) {
    this.data.add(edge)
  }
  public removeData(edge: Edge) {
    this.data.delete(edge)
  }
  public getData() {
    return Array.from(this.data).map(({ data }) => data)
  }

  /** bind outcoming edge */
  public addDownStream(edge: Edge) {
    this.downstream.add(edge)
  }
  public removeDownStream(edge: Edge) {
    this.downstream.delete(edge)
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
  edges.clear()
}

class Edge {
  static addEdge(from: Module, to: Module, data: any, updaterId: string) {
    const edge = new Edge(from, to, data, updaterId)
    if (to.moduleType === 'fs')
      throw new Error(`target module must be a virtule module`)
    from.addDownStream(edge)
    to.addData(edge)
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
    if (this.hasUnlinked) return
    this.from.removeDownStream(this)
    this.to.removeData(this)
    unbindEdgeWithUpdaterId(this)
    this.hasUnlinked = true
  }
}

interface UpdaterAPIs {
  updateModule(moduleId: string, data: any, upstreamModuleId: string): void
  getModuleData(moduleId: string): any[]
  deleteFsModule(moduleId: string): void
}
