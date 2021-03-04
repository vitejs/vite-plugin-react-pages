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
      addPageData,
      watchFiles,
    }

    // The file currently being processed.
    let currentFile: File | null = null

    let pagesPromise = Promise.resolve(pageCache)
    findPages(pagesDir, helpers)

    this.getPages = () => pagesPromise
    this.close = () => watchers.forEach((w) => w.close())

    function addPageData({
      pageId,
      key = 'main',
      dataPath,
      staticData,
    }: PageData) {
      if (!pageId.startsWith('/'))
        throw Error(
          `addPageData error: pageId should start with "/", but got "${pageId}"`
        )

      const existingPage = pageCache[pageId]
      const page =
        existingPage ||
        (pageCache[pageId] = {
          data: {},
          staticData: {},
        })

      if (dataPath) {
        if (page.data[key])
          throw Error(
            `addPageData conflict: data with key "${key}" already exists`
          )
        page.data[key] = dataPath
      }

      if (staticData) {
        if (page.staticData[key])
          throw Error(
            `addPageData conflict: staticData with key "${key}" already exists`
          )
        page.staticData[key] = staticData
      }

      if (currentFile) {
        let dataKeys = currentFile.dataKeys.get(pageId)
        if (!dataKeys) currentFile.dataKeys.set(pageId, (dataKeys = []))
        dataKeys.push(key)
      }

      if (existingPage) {
        changedPages.add(pageId)
        emitChange()
      }
    }

    function removePageData(dataKeys: string[], pageId: string) {
      const page = pageCache[pageId]

      dataKeys.forEach((key) => {
        delete page.data[key]
        delete page.staticData[key]
      })

      if (hasKeys(page.data) || hasKeys(page.staticData)) {
        changedPages.add(pageId)
        emitChange()
      } else {
        delete pageCache[pageId]
      }
    }

    function hasKeys(obj: object) {
      for (const _ in obj) return true
      return false
    }

    function watchFiles(
      baseDir: string,
      arg2?: string | string[] | FileHandler,
      arg3?: FileHandler
    ) {
      let globs: string[]
      let handler: FileHandler

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
        file: File
      ) => {
        // Clear any data associated with this file.
        file.dataKeys.forEach(removePageData)

        if (type === 'unlink') {
          delete fileCache[file.path]
        } else {
          if (type === 'change') {
            file.content = null
            file.dataKeys.clear()
          }
          currentFile = file
          try {
            const pageData = await handler(file)
            if (pageData) {
              addPageData(pageData)
            }
          } finally {
            currentFile = null
          }
        }
      }

      watchers.add(
        chokidar
          .watch(globs, {
            cwd: baseDir,
            ignored: ['**/node_modules/**/*'],
          })
          .on('all', (type, filePath) => {
            if (type !== 'addDir' && type !== 'unlinkDir') {
              filePath = path.join(baseDir, filePath)

              const file =
                fileCache[filePath] ||
                (fileCache[filePath] = new File(filePath, baseDir))

              if (!file.queued) {
                file.queued = true
                pagesPromise = pagesPromise.finally(() => {
                  file.queued = false
                  return processFile(type, file)
                })
                emitPromise()
              }
            }
          })
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
   * Add page data manually.
   */
  readonly addPageData: (pageData: PageData) => void
}

export class File {
  content: Promise<string> | null = null
  /** pageId -> dataKey[] */
  dataKeys = new Map<string, string[]>()
  /** When true, this file will be processed soon */
  queued = false

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
  (file: File): PageData | Promise<PageData> | void
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
