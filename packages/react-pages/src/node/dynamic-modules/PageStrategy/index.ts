import * as path from 'path'
import { EventEmitter } from 'events'
import slash from 'slash'
import { extractStaticData } from '../utils'
import { File, VirtualModulesManager } from '../VirtualModulesManager'
import {
  FileHandler,
  PagesDataKeeper,
  PagesData,
  PageAPIs,
  OnePageData,
} from './PagesDataKeeper'

export class PageStrategy extends EventEmitter {
  protected pagesDir: string = '/pagesDir_not_initialized'
  private virtualModulesManager: VirtualModulesManager = null as any
  private pagesDataKeeper: PagesDataKeeper = null as any
  private started = false

  constructor(private findPages: FindPages) {
    super()
  }

  /**
   * start() will be called by the vite buildStart hook,
   * which may be called multiple times.
   * we only execute it once
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

    this.virtualModulesManager.scheduleUpdate(
      'pages-init',
      async (virtuleModuleAPIs) => {
        this.oneTimePageAPIs =
          this.pagesDataKeeper.createOneTimePageAPIs(virtuleModuleAPIs)
        const helpers = this.createHelpers(() => {
          throw new Error(
            `No defaultFileHandler found. You should pass fileHandler argument when calling watchFiles`
          )
        })
        await this.findPages(pagesDir, helpers)
      }
    )
  }

  // these are one-time api that are only used in "pages-init"
  private oneTimePageAPIs: PageAPIs = null as any

  public getPages(): Promise<PagesData> {
    if (!this.started) throw new Error(`PageStrategy not started yet`)
    return new Promise((resolve) => {
      this.virtualModulesManager.callOnceWhenIdle(() => {
        resolve(this.pagesDataKeeper.getPages())
      })
    })
  }

  public getPage(pageId: string): Promise<OnePageData | null> {
    if (!this.started) throw new Error(`PageStrategy not started yet`)
    return new Promise((resolve) => {
      this.virtualModulesManager.callOnceWhenIdle(() => {
        resolve(this.pagesDataKeeper.getPage(pageId))
      })
    })
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
      const { pagesDir, pagesDataKeeper } = _this
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

      pagesDataKeeper.addFSWatcher(baseDir, globs, fileHandler)
    }
  }
}

export type FindPages = (
  pagesDir: string,
  helpers: PageHelpers
) => void | Promise<void>

export interface PageHelpers extends PageAPIs {
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

export interface WatchFilesHelper {
  /** Watch all files within a directory (except node_modules and .git) */
  (baseDir: string, fileHandler?: FileHandler): void
  /** Watch files matching the given glob */
  (baseDir: string, glob: string, fileHandler?: FileHandler): void
  /** Watch files matching one of the given globs */
  (baseDir: string, globs: string[], fileHandler?: FileHandler): void
}
