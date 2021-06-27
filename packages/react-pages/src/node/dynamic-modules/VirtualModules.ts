import * as fs from 'fs-extra'
import * as path from 'path'
import chokidar, { FSWatcher } from 'chokidar'
import slash from 'slash'

export class VirtualModuleGraph {
  private readonly modules: Modules = {}

  private updateQueue = new UpdateQueue()

  getModuleContent(moduleId: string): string | null {
    return null
  }

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
  scheduleUpdate(updaterId: string, updater: Update['updater']) {
    this.updateQueue.push(updaterId, updater)
  }

  // private updateModule(moduleId: string, data: any, upstreamModuleId: string) {
  //   const m = this.ensureModule(moduleId)
  //   m.data[upstreamModuleId] = data

  //   const upstream = this.ensureModule(upstreamModuleId)
  //   upstream.downstream.add(moduleId)
  // }

  // private ensureModule(moduleId: string) {
  //   if (this.modules[moduleId]) return this.modules[moduleId]
  //   return (this.modules[moduleId] = {
  //     id: moduleId,
  //     // dirty: false,
  //     data: {},
  //     downstream: new Set(),
  //   })
  // }

  watchModules() {}

  onRenderModule() {}

  onModuleUpdate() {}

  private createUpdateAPIs(): UpdaterAPIs {
    return {
      updateModule(moduleId: string, data: any, upstreamModuleId: string) {},
      getModuleData(moduleId: string, data: any, upstreamModuleId: string) {},
    }
  }

  async executeUpdates() {
    const update = this.updateQueue.pop()
    if (!update) return
    const apis = this.createUpdateAPIs()
    await update.updater(apis)
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

// the module inside this graph may be virtule module or real fs module
interface Modules {
  [moduleId: string]: Module
}

const VIRTULE_MODULE_PREFIX = '/@vp_virtule'

class Module {
  constructor(public id: string) {}

  /** has updated, need to update it's downstream */
  // dirty: boolean

  /**
   * the data sources of this virtule module
   * they are incoming edges in the graph
   *
   * real fs module won't need this
   */
  private data: Set<Edge> = new Set()

  /**
   * which modules depend on this module
   * they are outcoming edges in the graph
   *
   * it is needed because we need to update downstream modules
   * when a fs module is deleted
   */
  private downstream: Set<Edge> = new Set()

  public get isVirtuleModule() {
    return this.id.startsWith(VIRTULE_MODULE_PREFIX)
  }

  /** bind incoming edge */
  public addData(edge: Edge) {
    this.data.add(edge)
  }
  public removeData(edge: Edge) {
    this.data.delete(edge)
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
function linkEdgeWithUpdaterId(edge: Edge) {
  const { updaterId } = edge
  let edges = mapUpdaterIdToEdges.get(updaterId)
  if (!edges) {
    edges = new Set()
    mapUpdaterIdToEdges.set(updaterId, edges)
  }
  edges.add(edge)
}
function unlinkEdgeWithUpdaterId(edge: Edge) {
  const { updaterId } = edge
  let edges = mapUpdaterIdToEdges.get(updaterId)
  if (!edges) throw new Error(`assertion fail: unlinkEdgeWithUpdaterId`)
  edges.delete(edge)
}

class Edge {
  static addEdge(from: Module, to: Module, data: any, updaterId: string) {
    const edge = new Edge(from, to, data, updaterId)
    from.addDownStream(edge)
    to.addData(edge)
    linkEdgeWithUpdaterId(edge)
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
    unlinkEdgeWithUpdaterId(this)
    this.hasUnlinked = true
  }
}

interface UpdaterAPIs {
  updateModule(moduleId: string, data: any, upstreamModuleId: string): void
  getModuleData(moduleId: string, data: any, upstreamModuleId: string): void
}
