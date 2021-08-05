import * as fs from 'fs-extra'
import * as path from 'path'
import { EventEmitter } from 'events'
import chokidar, { FSWatcher } from 'chokidar'
import slash from 'slash'
import { extractStaticData, PendingList } from './utils'
import { PagesData, Association, HandlerAPI } from './PagesData'
import { UpdateBuffer } from './UpdateBuffer'
import { FileHandlerAPI, VirtualModulesManager } from './VirtualModulesManager'
import { FileHandler, PagesDataKeeper } from './PageData2'

export class PageStrategy extends EventEmitter {
  protected pagesDir: string = '/pagesDir_not_initialized'
  private virtualModulesManager: VirtualModulesManager = null as any
  // private fileCache: FileCache = {}
  // private watchers = new Set<FSWatcher>()
  private pagesDataKeeper: PagesDataKeeper = null as any
  private updateBuffer = new UpdateBuffer()
  /**
   * track how many works are pending
   * to avoid returning half-finished page data
   */
  // private pendingList = new PendingList()
  private started = false

  constructor(private findPages: FindPages) {
    super()
  }

  /**
   * start() will be called by the vite buildStart hook,
   * which may be called multiple times
   */
  public start(pagesDir: string, virtualModulesManager: VirtualModulesManager) {
    if (this.started) return
    this.started = true
    this.pagesDir = pagesDir

    this.virtualModulesManager = virtualModulesManager
    this.pagesDataKeeper = new PagesDataKeeper(virtualModulesManager)
    this.pagesDataKeeper.on('page', (updates: string[]) => {
      this.emit('page', updates)
    })
    this.pagesDataKeeper.on('page-list', () => {
      this.emit('page-list')
    })
    const helpers = this.createHelpers(() => {
      throw new Error(
        `No defaultFileHandler found. You should pass fileHandler argument when calling watchFiles`
      )
    })
    const { findPages } = this
    // this.pagesDataKeeper.addModuleListener()
    // pendingList.addPending(Promise.resolve(findPages(pagesDir, helpers)))

    this.virtualModulesManager.scheduleUpdate(
      'pages-init',
      async (updaterAPIs) => {
        const apis = this.pagesDataKeeper.createOneTimePageAPIs(updaterAPIs)
        this.oneTimePageAPIs = apis
        const helpers = this.createHelpers(() => {
          throw new Error(
            `No defaultFileHandler found. You should pass fileHandler argument when calling watchFiles`
          )
        })
        await findPages(pagesDir, helpers)
      }
    )
  }

  private oneTimePageAPIs: HandlerAPI = null as any

  public getPages(): Promise<Readonly<PagesData>> {
    if (!this.started) throw new Error(`PageStrategy not started yet`)
    return new Promise((resolve) => {
      // this.pagesDataKeeper
      return this.pendingList
        .subscribe()
        .then(() => this.pagesDataKeeper.toPagesData())
    })
  }
  public close() {
    if (!this.started) throw new Error(`PageStrategy not started yet`)
    this.watchers.forEach((w) => w.close())
  }
  /**
   * Custom PageStrategy can use it to create helpers with custom defaultFileHandler
   */
  protected createHelpers(defaultFileHandler: FileHandler): PageHelpers {
    const helpers: PageHelpers = {
      extractStaticData,
      watchFiles,
      ...this.oneTimePageAPIs,
    }
    const _this = this
    return helpers

    function watchFiles(
      baseDir: string,
      arg2?: string | string[] | FileHandler,
      arg3?: FileHandler
    ) {
      const {
        pagesDir,
        // pendingList,
        // watchers,
        // fileCache,
        updateBuffer,
        pagesDataKeeper,
        virtualModulesManager,
      } = _this

      // Strip trailing slash and make absolute
      baseDir = slash(path.resolve(pagesDir, baseDir))
      let globs: string[]
      let fileHandler: FileHandler
      if (typeof arg2 === 'function') {
        globs = ['**/*']
        fileHandler = arg2
      } else {
        globs = Array.isArray(arg2) ? arg2 : [arg2 || '**/*']
        fileHandler = arg3 || defaultFileHandler
      }

      pagesDataKeeper.addModuleListener(baseDir, globs, fileHandler)

      // virtualModulesManager

      // should wait for a complete fs scan
      // before returning the page data
      let fsScanFinish: () => void
      pendingList.addPending(
        new Promise((resolve) => {
          fsScanFinish = resolve
        })
      )
      watchers.add(
        chokidar
          .watch(globs, {
            cwd: baseDir,
            ignored: ['**/node_modules/**/*', '**/.git/**'],
          })
          .on('add', handleFileChange)
          .on('change', handleFileChange)
          .on('unlink', handleFileUnLink)
          .on('ready', () => fsScanFinish())
      )

      async function handleFileChange(filePath: string) {
        filePath = slash(path.join(baseDir, filePath))
        const file =
          fileCache[filePath] ||
          (fileCache[filePath] = new File(filePath, baseDir))
        file.content = null
        // should wait for the fileHandler to finish
        // before returning the page data
        pendingList.addPending(
          updateBuffer.batchUpdate(async (scheduleUpdate) => {
            const handlerAPI = pagesDataKeeper.createAPIForSourceFile(
              file,
              scheduleUpdate
            )
            const pageData = await fileHandler(file, handlerAPI)
            if (pageData) {
              handlerAPI.addPageData(pageData)
            }
          })
        )
      }

      function handleFileUnLink(filePath: string) {
        filePath = slash(path.join(baseDir, filePath))
        const file = fileCache[filePath]
        if (!file) return
        delete fileCache[filePath]
        pendingList.addPending(
          updateBuffer.batchUpdate(async (scheduleUpdate) => {
            pagesDataKeeper.deleteDataAssociatedWithFile(file, scheduleUpdate)
          })
        )
      }
    }
  }
}

export type FindPages = (
  pagesDir: string,
  helpers: PageHelpers
) => void | Promise<void>

export interface LoadPageData {
  (file: File, helpers: PageHelpers): PageData | Promise<PageData>
}

export interface PageData {
  /**
   * The page route path.
   * User can register multiple page data with same pageId,
   * as long as they have different keys.
   * Page data with same pageId will be merged.
   *
   * @example '/posts/hello-world'
   */
  readonly pageId: string
  /**
   * The data key.
   * For a same page, users can register multiple data pieces,
   * each with its own key. (Composed Page Data)
   *
   * @default 'main'
   */
  readonly key?: string
  /**
   * The path to the runtime data module.
   * It will be registered with the `key`.
   */
  readonly dataPath?: string
  /**
   * The value of static data.
   * It will be registered with the `key`.
   */
  readonly staticData?: any
}

export interface PageHelpers extends HandlerAPI {
  /**
   * Read the static data from a file.
   */
  readonly extractStaticData: (file: File) => Promise<{
    readonly [key: string]: any
    readonly sourceType: string
  }>
  /**
   * Scan the fileSystem and
   * set page data in the file handler.
   * File deletion will be handled automatically
   */
  readonly watchFiles: WatchFilesHelper
}

export class File {
  content: Promise<string> | null = null
  // the page data that this file is associated with
  associations: Set<Association> = new Set()
  /** When true, this file will be processed soon */
  queued = false

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

export interface WatchFilesHelper {
  /** Watch all files within a directory (except node_modules and .git) */
  (baseDir: string, fileHandler?: FileHandler): void
  /** Watch files matching the given glob */
  (baseDir: string, glob: string, fileHandler?: FileHandler): void
  /** Watch files matching one of the given globs */
  (baseDir: string, globs: string[], fileHandler?: FileHandler): void
}

interface FileCache {
  [filePath: string]: File
}
