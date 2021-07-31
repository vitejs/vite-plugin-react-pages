import * as fs from 'fs-extra'
import * as path from 'path'
import chokidar, { FSWatcher } from 'chokidar'
import slash from 'slash'

import { VirtualModuleGraph } from './VirtualModules'

let nextWatcherId = 0

/**
 * watch fs and update corresponding virtule module when a file changed
 */
export class VirtualModulesManager {
  private watchers = new Set<FSWatcher>()
  private virtuleModules = new VirtualModuleGraph()
  private fileCache: { [path: string]: File } = {}

  public addFSWatcher(
    globs: string[],
    baseDir: string,
    fileHandler: FileHandler
  ) {
    const watcherId = String(nextWatcherId++)

    this.watchers.add(
      chokidar
        .watch(globs, {
          cwd: baseDir,
          ignored: ['**/node_modules/**/*', '**/.git/**'],
        })
        .on('add', this.handleFileChange(baseDir, fileHandler, watcherId))
        .on('change', this.handleFileChange.bind(this))
        .on('unlink', this.handleFileUnLink(baseDir, watcherId))
      // .on('ready', () => fsScanFinish())
    )
  }

  public close() {
    this.watchers.forEach((w) => w.close())
  }

  private handleFileChange(
    baseDir: string,
    fileHandler: FileHandler,
    watcherId: string
  ) {
    return async (filePath: string) => {
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
          const handlerAPI = {
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

interface FileHandlerAPI {
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
