import equal from 'fast-deep-equal'
import { FileHandler } from './PageStrategy'

import { UpdateBuffer } from './UpdateBuffer'
import { VirtualModulesManager } from './VirtualModulesManager'

const PAGE_MODULE_PREFIX = '/@vp-page-one'
const ensurePageId = (moduleId: string) =>
  moduleId.startsWith(PAGE_MODULE_PREFIX)
    ? moduleId.slice(PAGE_MODULE_PREFIX.length)
    : moduleId
const PAGE_LIIST_MODULE = '/@vp-page-list'

export class PagesDataKeeper extends UpdateBuffer {
  private readonly pages: PagesDataInternal = {}

  constructor(private readonly virtualModulesManager: VirtualModulesManager) {
    super()
    virtualModulesManager.getModules((modules) => {
      Object.entries(modules).forEach(([moduleId, data]) => {
        this.setPageData(moduleId, data)
      })
      virtualModulesManager.addModuleListener(
        (moduleId, data) => {
          this.setPageData(moduleId, data)
        },
        (moduleId) =>
          moduleId.startsWith(PAGE_MODULE_PREFIX) ||
          moduleId.startsWith(PAGE_LIIST_MODULE)
      )
    })
  }

  isEmptyPage(pageId: string) {
    const page = this.pages[pageId]
    if (!page) return true
    const { runtimeData, staticData } = page
    return (
      Object.keys(runtimeData).length === 0 &&
      Object.keys(staticData).length === 0
    )
  }

  private setPageData(pageId: string, rawData: any[]) {
    pageId = ensurePageId(pageId)
    const pageData = this.createPageDataFromRaw(rawData)
    if (this.isEmptyPage(pageId)) {
      this.pages[pageId] = pageData
      this.scheduleUpdate({
        type: 'add',
        pageId,
      })
      return
    }
    const prev = this.pages[pageId]
    this.pages[pageId] = pageData
    if (!equal(pageData.runtimeData, prev.runtimeData)) {
      this.scheduleUpdate({
        type: 'update',
        dataType: 'runtime',
        pageId,
      })
    }
    if (!equal(pageData.staticData, prev.staticData)) {
      this.scheduleUpdate({
        type: 'update',
        dataType: 'static',
        pageId,
      })
    }
  }

  private createPageDataFromRaw(rawData: any[]) {
    const pageData: OnePageDataInternal = {
      runtimeData: {},
      staticData: {},
    }
    const { runtimeData: dataMap, staticData: staticDataMap } = pageData
    rawData.forEach((data: DataPiece) => {
      if (!data) return
      const { key, dataPath, staticData } = data
      const priority = data.priority ?? 1
      if (!key) return
      if (!dataPath && !staticData) return
      if (dataPath) {
        if (!dataMap[key] || priority > dataMap[key].priority) {
          dataMap[key] = { dataPath, priority }
        }
      }
      if (staticData) {
        if (!staticDataMap[key] || priority > staticDataMap[key].priority) {
          staticDataMap[key] = { staticData, priority }
        }
      }
    })

    return pageData
  }

  public addModuleListener(
    baseDir: string,
    globs: string[],
    fileHandler: FileHandler
  ) {
    // return this.virtuleModules.addModuleListener(handler, filter)
    this.virtualModulesManager.addFSWatcher(
      baseDir,
      globs,
      async (file, lowerAPI) => {}
    )
  }

  createPageUpdateAPI() {}
}

export interface DataPiece {
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
  /**
   * when multiple data pieces have same key (conflict),
   * the data piece with highest priority will win
   */
  readonly priority?: number
}

export interface PagesData {
  /**
   * pageId: The page route path.
   * User can register multiple page data with same pageId,
   * as long as they have different keys.
   * Page data with same pageId will be merged.
   *
   * @example '/posts/hello-world'
   */
  [pageId: string]: {
    data: {
      [key: string]: string
    }
    staticData: {
      [key: string]: any
    }
  }
}

interface PagesDataInternal {
  [pageId: string]: OnePageDataInternal
}

interface OnePageDataInternal {
  runtimeData: {
    /**
     * The value of runtimeData shoule be a path to module
     * (to be evaluated at runtime)
     */
    [key: string]: { dataPath: string; priority: number }
  }
  staticData: {
    /**
     * The value of staticData can be any json value
     */
    [key: string]: { staticData: any; priority: number }
  }
}

export interface HandlerAPI {
  /**
   * Get a mutable data object of runtimeData
   */
  getRuntimeData: (pageId: string) => {
    [key: string]: string
  }
  /**
   * Get a mutable data object of staticData
   */
  getStaticData: (pageId: string) => {
    [key: string]: any
  }
  /**
   * Add page data.
   * If the data already exists, overwrite it.
   */
  addPageData: (pageData: DataPiece) => void
}
