import * as path from 'path'
import { EventEmitter } from 'events'
import slash from 'slash'

import {
  extractStaticData,
  VirtualModulesManager,
} from '../utils/virtual-module'
import { PagesDataKeeper, PagesData, OnePageData } from './PagesDataKeeper'
import type { FindPages, PageHelpers, FileHandler, PageAPIs } from './types.doc'

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
      async (virtualModuleAPIs) => {
        this.oneTimePageAPIs =
          this.pagesDataKeeper.createOneTimePageAPIs(virtualModuleAPIs)
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

export * from './types.doc'
