import equal from 'fast-deep-equal'

import { PageUpdateBuffer } from './UpdateBuffer'
import {
  VirtuleModuleAPIs,
  File,
  FileHandlerAPIs,
  VirtualModulesManager,
} from '../utils/virtual-module'

const PAGE_MODULE_PREFIX = '/@vp-page'
const ensurePageId = (moduleId: string) =>
  moduleId.startsWith(PAGE_MODULE_PREFIX)
    ? moduleId.slice(PAGE_MODULE_PREFIX.length)
    : moduleId
const ensureModuleId = (pageId: string) =>
  pageId.startsWith(PAGE_MODULE_PREFIX) ? pageId : PAGE_MODULE_PREFIX + pageId

const isPageRelatedModule = (moduleId: string) =>
  moduleId.startsWith(PAGE_MODULE_PREFIX)

/**
 * building upon VirtualModulesManager,
 * PagesDataKeeper recognize and handle page modules.
 */
export class PagesDataKeeper extends PageUpdateBuffer {
  /**
   * this.pages is a cache of this.virtualModulesManager.getModules
   * which is updated in batch (may be outdated for a short time)
   */
  private readonly pages: PagesDataInternal = {}

  constructor(private readonly virtualModulesManager: VirtualModulesManager) {
    super()
    virtualModulesManager.getModules((modules) => {
      Object.entries(modules).forEach(([moduleId, data]) => {
        this.setPageData(moduleId, data)
      })
      virtualModulesManager.addModuleListener((moduleId, data) => {
        this.setPageData(moduleId, data)
      }, isPageRelatedModule)
    }, isPageRelatedModule)
  }

  /** turn PagesDataInternal to PagesData */
  public getPages(): PagesData {
    return Object.fromEntries(
      Object.entries(this.pages).map(([pageId, page]) => [
        pageId,
        transformOnePageDataInternal(page),
      ])
    )
  }

  public getPage(pageId: string): OnePageData | null {
    const page = this.pages[pageId]
    if (!page) return null
    return transformOnePageDataInternal(page)
  }

  /**
   * when low-level page virtule modules has changed, update this.pages data
   * and notify listeners
   */
  private setPageData(moduleId: string, rawData: any[]) {
    const pageId = ensurePageId(moduleId)
    const oldPageData: OnePageDataInternal | undefined = this.pages[pageId]
    const pageData = this.createPageDataFromRaw(rawData)
    // Page is deleted
    if (!pageData) {
      if (oldPageData) {
        delete this.pages[pageId]
        this.scheduleUpdate({
          type: 'delete',
          pageId,
        })
      }
      return
    }
    // Page is added
    if (!oldPageData) {
      this.pages[pageId] = pageData
      this.scheduleUpdate({
        type: 'add',
        pageId,
      })
      return
    }
    // Page is updated
    this.pages[pageId] = pageData
    if (!equal(pageData.runtimeData, oldPageData.runtimeData)) {
      this.scheduleUpdate({
        type: 'update',
        dataType: 'runtime',
        pageId,
      })
    }
    if (!equal(pageData.staticData, oldPageData.staticData)) {
      this.scheduleUpdate({
        type: 'update',
        dataType: 'static',
        pageId,
      })
    }
  }

  private createPageDataFromRaw(rawData: any[]): OnePageDataInternal | null {
    const pageData: OnePageDataInternal = {
      runtimeData: {},
      staticData: {},
    }
    const { runtimeData: dataMap, staticData: staticDataMap } = pageData
    rawData.forEach((data: DataPiece) => {
      if (!data) return
      const { dataPath, staticData } = data
      if (!dataPath && !staticData) return
      const key = data.key ?? 'main'
      const priority = data.priority ?? 1
      if (dataPath) {
        if (!dataMap[key] || priority > dataMap[key].priority)
          dataMap[key] = { dataPath, priority }
      }
      if (staticData) {
        if (!staticDataMap[key] || priority > staticDataMap[key].priority)
          staticDataMap[key] = { staticData, priority }
      }
    })
    if (isEmptyPage(pageData)) return null
    return pageData

    function isEmptyPage(pageData: OnePageDataInternal) {
      const { runtimeData, staticData } = pageData
      return (
        Object.keys(runtimeData).length === 0 &&
        Object.keys(staticData).length === 0
      )
    }
  }

  /**
   * update page virtule modules according to fs files
   */
  public addFSWatcher(
    baseDir: string,
    globs: string[],
    fileHandler: FileHandler
  ) {
    this.virtualModulesManager.addFSWatcher(
      baseDir,
      globs,
      async (file, lowerAPI) => {
        const pageAPIs = this.createPageAPIs(lowerAPI)
        const res = await fileHandler(file, pageAPIs)
        if (res) {
          pageAPIs.addPageData(res)
        }
      }
    )
  }

  public createOneTimePageAPIs(updaterAPIs: VirtuleModuleAPIs): PageAPIs {
    const handlerAPI: FileHandlerAPIs = {
      addModuleData(moduleId: string, data: any) {
        // if the update has no upstream, use a constant name
        updaterAPIs.addModuleData(moduleId, data, 'VP_ANONYMOUS_MODULE')
      },
      getModuleData: updaterAPIs.getModuleData,
    }
    return this.createPageAPIs(handlerAPI)
  }

  /**
   * TODO:
   * getRuntimeData and getStaticData are very inefficient to implement,
   * redesign them in the next verion
   */
  private createPageAPIs(lowerAPI: FileHandlerAPIs): PageAPIs {
    const getRuntimeData = (pageId: string) => {
      const moduleId = ensureModuleId(pageId)
      // don't use pages as data source because this is a cache updated in batch.
      // instead, get data by virtualModulesManager._getModuleDataNow
      // which is updated immediately after updateing virtule modules
      const getDataObject = () => {
        // reconstruct the data object, which is inefficient
        const rawData = this.virtualModulesManager._getModuleDataNow(moduleId)
        const pageData = this.createPageDataFromRaw(rawData)
        if (!pageData) return {}
        return pageData.runtimeData
      }
      const setData = (key: string, value: any) => {
        lowerAPI.addModuleData(moduleId, {
          key,
          dataPath: value,
        } as DataPiece)
      }
      const getData = (key: string) => {
        const existValue = getDataObject()[key]
        return existValue?.dataPath
      }
      return createProxy({ getDataObject, setData, getData })
    }

    const getStaticData = (pageId: string) => {
      const moduleId = ensureModuleId(pageId)
      const getDataObject = () => {
        const rawData = this.virtualModulesManager._getModuleDataNow(moduleId)
        const pageData = this.createPageDataFromRaw(rawData)
        if (!pageData) return {}
        return pageData.staticData
      }
      const setData = (key: string, value: any) => {
        lowerAPI.addModuleData(moduleId, {
          key,
          staticData: value,
        } as DataPiece)
      }
      const getData = (key: string) => {
        const existValue = getDataObject()[key]
        return existValue?.staticData
      }
      return createProxy({ getDataObject, setData, getData })
    }

    const addPageData = (dataPiece: DataPiece) => {
      const moduleId = ensureModuleId(dataPiece.pageId)
      lowerAPI.addModuleData(moduleId, dataPiece)
    }

    return {
      getRuntimeData,
      getStaticData,
      addPageData,
    }

    function createProxy({
      getDataObject,
      setData,
      getData,
    }: {
      getDataObject: () => object
      setData: (key: string, value: any) => void
      getData: (key: string) => any
    }) {
      return new Proxy(
        {} as {
          [key: string]: string
        },
        {
          ...defaultProxyTraps,
          set(target, key: string, value) {
            setData(key, value)
            return true
          },
          get(target, key: string) {
            return getData(key)
          },
          has(target, key) {
            return Reflect.has(getDataObject(), key)
          },
          ownKeys: function (target) {
            return Reflect.ownKeys(getDataObject())
          },
        }
      )
    }
  }
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
   * @default 1
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
  [pageId: string]: OnePageData
}

export interface OnePageData {
  data: {
    [key: string]: string
  }
  staticData: {
    [key: string]: any
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

export interface PageAPIs {
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

export type FileHandler = (
  file: File,
  api: PageAPIs
) => void | Promise<void> | DataPiece | Promise<DataPiece>

const defaultProxyTraps = Object.fromEntries(
  Object.getOwnPropertyNames(Reflect).map((fnName) => [
    fnName,
    () => {
      throw new Error(`unsupported operation on page data obejct proxy`)
    },
  ])
)

function transformOnePageDataInternal(page: OnePageDataInternal): OnePageData {
  const runtimeData = Object.fromEntries(
    Object.entries(page.runtimeData).map(([key, { dataPath }]) => [
      key,
      dataPath,
    ])
  )
  const staticData = Object.fromEntries(
    Object.entries(page.staticData).map(([key, { staticData }]) => [
      key,
      staticData,
    ])
  )
  return { data: runtimeData, staticData }
}
