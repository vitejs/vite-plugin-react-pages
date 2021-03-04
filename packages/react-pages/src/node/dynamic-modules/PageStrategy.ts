import * as fs from 'fs-extra'
import * as path from 'path'
import { EventEmitter } from 'events'
import chokidar, { FSWatcher } from 'chokidar'
import { debounce } from 'mini-debounce'
import { PagesData } from './pages'
import {
  extractStaticData,
  defaultPageLoader,
  defaultPageFinder,
} from './utils'

export class PageStrategy extends EventEmitter {
  readonly getPages: () => Promise<Readonly<PagesData>>
  readonly close: () => void

  constructor(
    pagesDir: string,
    findPages: FindPages = defaultPageFinder,
    loadPageData: LoadPageData = defaultPageLoader
  ) {
    super()

    const pageCache: PagesData = {}
    const fileCache: FileCache = {}
    const watchers = new Set<FSWatcher>()

    // The "promise" event is for HMR updates to the pages map.
    const emitPromise = debounce(() => {
      this.emit('promise', pagesPromise)
    }, 100)

    // The "change" event is for HMR updates to each page.
    const changedPages = new Set<string>()
    const emitChange = debounce(() => {
      this.emit('change', Array.from(changedPages))
      changedPages.clear()
    }, 100)

    const helpers: PageHelpers = {
      extractStaticData,
      loadPageData: (file) => Promise.resolve(loadPageData(file, helpers)),
      setPageData,
      removePageData,
      watchFiles,
    }

    let pagesPromise = Promise.resolve(pageCache)
    findPages(pagesDir, helpers)

    this.getPages = () => pagesPromise
    this.close = () => watchers.forEach((w) => w.close())

    // Ensure file changes are processed before resolving `getPages` call.
    function onPageUpdate(update: Promise<void>) {
      pagesPromise = Promise.all([pagesPromise, update]).then(() => pageCache)
      emitPromise()
    }

    function setPageData(pageId: string, pageData: Partial<PageData>) {
      if (!pageId.startsWith('/'))
        throw Error(
          `setPageData error: pageId should start with "/", but got "${pageId}"`
        )

      const existingPage = pageCache[pageId]
      const page =
        existingPage ||
        (pageCache[pageId] = {
          data: {},
          staticData: {},
        })

      const key = pageData.key ?? 'main'
      if (pageData.dataPath) {
        if (page.data[key])
          throw Error(
            `setPageData conflict: data with key "${key}" already exists`
          )
        page.data[key] = pageData.dataPath
      }
      if (pageData.staticData) {
        if (page.staticData[key])
          throw Error(
            `setPageData conflict: staticData with key "${key}" already exists`
          )
        page.staticData[key] = pageData.staticData
      }

      if (existingPage) {
        changedPages.add(pageId)
        emitChange()
      }
    }

    function removePageData(pageId: string, key?: string) {
      const page = pageCache[pageId]
      if (page) {
        if (key) {
          delete page.data[key]
          delete page.staticData[key]
          changedPages.add(pageId)
          emitChange()
        } else {
          delete pageCache[pageId]
        }
      }
    }

    function watchFiles(
      baseDir: string,
      arg2?: string | string[] | FileHandler,
      arg3?: FileHandler
    ) {
      let globs: string[]
      let handler: (
        file: File,
        type: string
      ) => PageData | Promise<PageData> | void

      if (typeof arg2 === 'function') {
        globs = ['**/*']
        handler = arg2
      } else {
        globs = Array.isArray(arg2) ? arg2 : [arg2 || '**/*']
        handler = arg3 || defaultPageLoader
      }

      // Strip trailing slash and make absolute
      baseDir = path.resolve(pagesDir, baseDir)

      const processFile = async (
        type: 'add' | 'change' | 'unlink',
        filePath: string
      ) => {
        filePath = path.join(baseDir, filePath)

        const file =
          fileCache[filePath] ||
          (fileCache[filePath] = new File(filePath, baseDir))

        file.pageIds.forEach((pageId) => {
          delete pageCache[pageId]
        })

        if (type === 'change') {
          file.content = null
          file.pageIds.clear()
        }

        const result =
          handler.length > 1 || type !== 'unlink'
            ? await handler(file, type)
            : null

        if (type === 'unlink') {
          delete fileCache[file.path]
        } else if (result) {
          file.pageIds.add(result.pageId)
          setPageData(result.pageId, result)
        }
      }

      watchers.add(
        chokidar
          .watch(globs, {
            cwd: baseDir,
            ignored: ['**/node_modules/**/*'],
          })
          .on(
            'all',
            (type, filePath) =>
              type !== 'addDir' &&
              type !== 'unlinkDir' &&
              onPageUpdate(processFile(type, filePath))
          )
      )
    }
  }
}

export interface FindPages {
  (pagesDir: string, helpers: PageHelpers): void
}

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
   * If it conflicts with an already-registered data,
   * error will be thrown.
   *
   * @default 'main'
   */
  readonly key?: string
  /**
   * The path to the runtime data module
   */
  readonly dataPath?: string

  readonly staticData?: any
}

export interface PageHelpers {
  /**
   * Read the static data from a file.
   */
  readonly extractStaticData: (
    file: File
  ) => Promise<{
    readonly [key: string]: any
    readonly sourceType: string
  }>
  /**
   * Watch files for changes (not necessarily pages).
   *
   * Return page data to have deletion handled automatically.
   * If no handler is passed, the `loadPageData` helper is used
   * on every matching file.
   */
  readonly watchFiles: WatchFilesHelper
  /**
   * Load page data using the default page loader.
   */
  readonly loadPageData: (file: File) => Promise<PageData>
  /**
   * Upsert page data manually.
   */
  readonly setPageData: (pageId: string, pageData: Partial<PageData>) => void
  /**
   * Remove page data manually.
   */
  readonly removePageData: (pageId: string, dataKey?: string) => void
}

export class File {
  pageIds = new Set<string>()
  content: Promise<string> | null = null

  constructor(readonly path: string, readonly base: string) {}

  get relative() {
    return path.relative(this.base, this.path)
  }

  get extname() {
    return path.extname(this.path).slice(1)
  }

  read() {
    return this.content || (this.content = fs.readFile(this.path, 'utf-8'))
  }
}

interface FileHandler {
  /** Associate page data with a file */
  (file: File): PageData | Promise<PageData>
  /** Handle file changes */
  (file: File, type: 'add' | 'change' | 'unlink'): void
}

interface WatchFilesHelper {
  /** Watch all files within a directory (except node_modules) */
  (baseDir: string, handler?: FileHandler): void
  /** Watch files matching the given glob */
  (baseDir: string, glob: string, handler?: FileHandler): void
  /** Watch files matching one of the given globs */
  (baseDir: string, globs: string[], handler?: FileHandler): void
}

interface FileCache {
  [filePath: string]: File
}
