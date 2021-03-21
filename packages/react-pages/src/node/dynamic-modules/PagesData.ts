import { File } from './PageStrategy'
import type { ScheduleUpdate } from './UpdateBuffer'

export class PagesDataKeeper {
  private pages: PagesDataInternal = {}

  /**
   * If the page page does not come from local file,
   * then we create this api to track the source of page data.
   * When a file is unlinked,
   * the data associated with it will automatically get deleted.
   */
  createAPIForSourceFile(
    sourceFile: File,
    scheduleUpdate: ScheduleUpdate
  ): HanlderAPI {
    return {
      getRuntimeData: (
        pageId: string
      ): {
        [key: string]: string
      } =>
        this.createMutableProxy(pageId, 'runtime', sourceFile, scheduleUpdate),
      getStaticData: (
        pageId: string
      ): {
        [key: string]: any
      } =>
        this.createMutableProxy(pageId, 'static', sourceFile, scheduleUpdate),
    }
  }

  /**
   * If the page page does not come from local file (.e.g from remote database),
   * then we can't track the source of page data.
   */
  createAPIForCustomSource(scheduleUpdate: ScheduleUpdate): HanlderAPI {
    return {
      getRuntimeData: (
        pageId: string
      ): {
        [key: string]: string
      } => this.createMutableProxy(pageId, 'runtime', null, scheduleUpdate),
      getStaticData: (
        pageId: string
      ): {
        [key: string]: any
      } => this.createMutableProxy(pageId, 'static', null, scheduleUpdate),
    }
  }

  private createMutableProxy(
    pageId: string,
    dataType: 'runtime' | 'static',
    sourceFile: File | null,
    scheduleUpdate: ScheduleUpdate
  ): {
    [key: string]: any
  } {
    const _this = this
    const dataObj = this.getDataObj(pageId, dataType)
    return new Proxy(dataObj, {
      set(target, prop: string, value) {
        // delete data with key 'prop'
        if (value === undefined) {
          const existValue = dataObj[prop]
          if (existValue) {
            existValue.unBind(scheduleUpdate)
          }
          return true
        }
        new Association(
          _this,
          pageId,
          dataType,
          prop,
          value,
          sourceFile,
          scheduleUpdate
        )
        return true
      },
      get(target, prop: string) {
        const association = target[prop]
        if (association === undefined) return undefined
        return association.value
      },
    })
  }

  toPagesData(): PagesData {
    const result: PagesData = {}
    Object.entries(this.pages).forEach(([pageId, page]) => {
      if (this.isEmptyPage(pageId)) return

      const runtimeData = Object.fromEntries(
        Object.entries(page.runtimeData).map(([key, value]) => [
          key,
          value.value,
        ])
      )
      const staticData = Object.fromEntries(
        Object.entries(page.staticData).map(([key, value]) => [
          key,
          value.value,
        ])
      )
      result[pageId] = {
        data: runtimeData,
        staticData,
      }
    })
    return result
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

  private initPageIfNotExist(pageId: string) {
    let page = this.pages[pageId]
    if (!page) {
      page = this.pages[pageId] = { runtimeData: {}, staticData: {} }
    }
    return page
  }

  getDataObj(pageId: string, type: 'runtime' | 'static') {
    const page = this.initPageIfNotExist(pageId)
    if (type === 'runtime') return page.runtimeData
    return page.staticData
  }

  /**
   * delete all (runtime or static) data of a page
   */
  private clearPageData(
    pageId: string,
    dataType: 'runtime' | 'static',
    scheduleUpdate: ScheduleUpdate
  ) {
    const dataObj = this.getDataObj(pageId, dataType)
    Object.values(dataObj).forEach((association) => {
      association.unBind(scheduleUpdate)
    })
  }

  /**
   * delete all data related to sourceFile
   */
  deleteDataAssociatedWithFile(
    sourceFile: File,
    scheduleUpdate: ScheduleUpdate
  ) {
    sourceFile.associations.forEach((association) => {
      association.unBind(scheduleUpdate)
    })
  }
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
  [pageId: string]: {
    runtimeData: {
      /**
       * The value of runtimeData shoule be a path to module
       * (to be evaluated at runtime)
       */
      [key: string]: Association<string>
    }
    staticData: {
      /**
       * The value of staticData can be any json value
       */
      [key: string]: Association<any>
    }
  }
}

export interface HanlderAPI {
  getRuntimeData: (
    pageId: string
  ) => {
    [key: string]: string
  }
  getStaticData: (
    pageId: string
  ) => {
    [key: string]: any
  }
}

export class Association<ValueType = any> {
  private dataObj: { [key: string]: Association }

  constructor(
    private pagesDataKeeper: PagesDataKeeper,
    private pageId: string,
    private dataType: 'runtime' | 'static',
    /** the key of this record in the dataObj */

    private key: string,
    public value: ValueType,
    /**
     * when sourceFile is updated (or deleted),
     * this piece of data shoule also be updated(or deleted)
     */
    private sourceFile: File | null,
    scheduleUpdate: ScheduleUpdate
  ) {
    this.dataObj = pagesDataKeeper.getDataObj(pageId, dataType)
    const existValue = this.dataObj[key]
    const isEmptyBeforeSet = pagesDataKeeper.isEmptyPage(pageId)
    // delete exist data and its file association
    if (existValue) {
      existValue.unBind(scheduleUpdate)
    }
    this.dataObj[key] = this
    if (sourceFile) sourceFile.associations.add(this)
    if (isEmptyBeforeSet) {
      // a new page is added
      scheduleUpdate({
        type: 'add',
        pageId,
      })
    } else {
      scheduleUpdate({
        type: 'update',
        pageId,
      })
    }
  }

  /**
   * delete this piece of data and
   * unbind its file association
   */
  unBind(scheduleUpdate: ScheduleUpdate) {
    const dataObj = this.pagesDataKeeper.getDataObj(this.pageId, this.dataType)
    delete dataObj[this.key]
    if (this.sourceFile) this.sourceFile.associations.delete(this)
    if (this.pagesDataKeeper.isEmptyPage(this.pageId)) {
      // the whole page is empty
      scheduleUpdate({
        type: 'delete',
        pageId: this.pageId,
      })
    } else {
      scheduleUpdate({
        type: 'update',
        pageId: this.pageId,
      })
    }
  }
}
