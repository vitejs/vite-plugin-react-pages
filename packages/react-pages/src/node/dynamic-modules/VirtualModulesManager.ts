import * as fs from 'fs-extra'
import * as path from 'path'
import chokidar, { FSWatcher } from 'chokidar'
import slash from 'slash'

import {
  ModuleListener,
  UpdaterAPIs,
  VirtualModuleGraph,
  VolatileTaskState,
} from './VirtualModules'

let nextWatcherId = 0

/**
 * watch fs and update corresponding virtule module when a file changed
 */
export class VirtualModulesManager {
  private watchers = new Set<FSWatcher>()
  private virtuleModules = new VirtualModuleGraph()
  private fileCache: { [path: string]: File } = {}
  /**
   * don't return half-finished data when there are pending tasks
   */
  private pendingTaskCounter = new PendingTaskCounter()

  constructor() {
    this.pendingTaskCounter.countVolatileTask(this.virtuleModules.executeState)
  }

  public addFSWatcher(
    baseDir: string,
    globs: string[],
    fileHandler: FileHandler
  ) {
    const watcherId = String(nextWatcherId++)

    // should wait for a complete fs scan
    // before returning the page data
    const fsScanFinish = this.pendingTaskCounter.countTask()

    this.watchers.add(
      chokidar
        .watch(globs, {
          cwd: baseDir,
          ignored: ['**/node_modules/**/*', '**/.git/**'],
        })
        .on('add', this.handleFileChange(baseDir, fileHandler, watcherId))
        .on('change', this.handleFileChange(baseDir, fileHandler, watcherId))
        .on('unlink', this.handleFileUnLink(baseDir, watcherId))
        .on('ready', () => fsScanFinish())
    )
  }

  public getModules(
    cb: (modules: { [id: string]: any[] }) => void,
    filter?: (moduleId: string) => boolean
  ) {
    this.pendingTaskCounter.callOnceWhenEmpty(() => {
      cb(this.virtuleModules.getModules(filter))
    })
  }

  /**
   * Idel means: fs watcher is ready and no update is executing
   * TODO: and update queue is empty
   */
  public callOneceWhenIdle(cb: () => void) {
    this.pendingTaskCounter.callOnceWhenEmpty(cb)
  }

  /**
   * return the current state of modules.
   * it doesn't wait for current task to finish.
   * use it carefully.
   */
  public _getModulesNow(filter?: (moduleId: string) => boolean) {
    return this.virtuleModules.getModules(filter)
  }
  /**
   * return the current state of module.
   * it doesn't wait for current task to finish.
   * use it carefully.
   */
  public _getModuleDataNow(moduleId: string) {
    return this.virtuleModules.getModuleData(moduleId)
  }

  public addModuleListener(
    handler: ModuleListener,
    filter?: (moduleId: string) => boolean
  ) {
    return this.virtuleModules.addModuleListener(handler, filter)
  }

  public close() {
    this.watchers.forEach((w) => w.close())
  }

  public scheduleUpdate(
    updaterId: string,
    updater: (apis: UpdaterAPIs) => void | Promise<void>
  ): void {
    return this.virtuleModules.scheduleUpdate(updaterId, updater)
  }

  private handleFileChange(
    baseDir: string,
    fileHandler: FileHandler,
    watcherId: string
  ) {
    return (filePath: string) => {
      filePath = slash(path.join(baseDir, filePath))

      const file =
        this.fileCache[filePath] ||
        (this.fileCache[filePath] = new File(filePath, baseDir))
      // update content cache
      file.content = null
      file.read()

      this.virtuleModules.scheduleUpdate(
        `${watcherId}-${filePath}`,
        async (apis) => {
          const handlerAPI: FileHandlerAPI = {
            addModuleData(moduleId: string, data: any) {
              apis.addModuleData(moduleId, data, filePath)
            },
            getModuleData: apis.getModuleData,
          }
          await fileHandler(file, handlerAPI)
        }
      )
    }
  }

  private handleFileUnLink(baseDir: string, watcherId: string) {
    return (filePath: string) => {
      filePath = slash(path.join(baseDir, filePath))

      this.virtuleModules.scheduleUpdate(
        `${watcherId}-${filePath}-unlink`,
        async (apis) => {
          apis.deleteModule(filePath)
        }
      )
    }
  }
}

type FileHandler = (file: File, api: FileHandlerAPI) => void | Promise<void>

export interface FileHandlerAPI {
  addModuleData(moduleId: string, data: any): void
  getModuleData(moduleId: string): any[]
}

export class File {
  content: Promise<string> | null = null

  constructor(readonly path: string, readonly base: string) {}

  get relative() {
    return path.posix.relative(this.base, this.path)
  }

  get extname() {
    return path.posix.extname(this.path).slice(1)
  }

  read() {
    return this.content || (this.content = fs.readFile(this.path, 'utf-8'))
  }
}

class PendingTaskCounter {
  private count = 0
  private callbacks: (() => void)[] = []

  public countTask() {
    this.count++
    let ended = false
    return () => {
      if (ended) return
      ended = true
      this.count--
      if (this.count === 0) {
        this.callbacks.forEach((cb) => cb())
        this.callbacks.length = 0
      }
    }
  }

  /**
   * the callback style is preferred over the promise style
   * because cb will be called **synchronously** when count turn 0
   * while promise-then-cb would be called in next microtask (at that time the state may have changed)
   */
  public callOnceWhenEmpty(cb: () => void) {
    if (this.count === 0) {
      cb()
    } else {
      this.callbacks.push(cb)
    }
  }

  public countVolatileTask(volatileTaskState: VolatileTaskState) {
    let stopCounting: undefined | (() => void)
    volatileTaskState.onStateChange((isBusy) => {
      if (isBusy) {
        // if this task has already been counted, don't count again
        if (stopCounting) return
        stopCounting = this.countTask()
      } else {
        stopCounting?.()
      }
    })
  }
}
