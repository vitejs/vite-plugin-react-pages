import * as fs from 'fs-extra'
import * as path from 'path'
import { EventEmitter } from 'events'
import chokidar, { FSWatcher } from 'chokidar'
import {
  extractStaticData,
  defaultFileHandler,
  defaultPageFinder,
  PendingList,
} from './utils'
import {
  PagesDataKeeper,
  PagesData,
  Association,
  HanlderAPI,
} from './PagesData'
import { UpdateBuffer } from './UpdateBuffer'

export class PageStrategy extends EventEmitter {
  readonly getPages: () => Promise<Readonly<PagesData>>
  readonly close: () => void

  constructor(pagesDir: string, findPages: FindPages = defaultPageFinder) {
    super()

    const fileCache: FileCache = {}
    const watchers = new Set<FSWatcher>()
    const pagesDataKeeper = new PagesDataKeeper()
    const updateBuffer = new UpdateBuffer()
    /**
     * track how many works are pending
     * to avoid returning half-finished page data
     */
    const pendingList = new PendingList()

    updateBuffer.on('page', (updates: string[]) => {
      this.emit('page', updates)
    })

    updateBuffer.on('page-list', () => {
      this.emit('page-list')
    })

    const apiForCustomSource = pagesDataKeeper.createAPIForCustomSource(
      updateBuffer.scheduleUpdate.bind(updateBuffer)
    )

    const helpers: PageHelpers = {
      extractStaticData,
      watchFiles,
      ...apiForCustomSource,
    }

    pendingList.addPending(
      Promise.resolve(
        findPages(pagesDir, {
          ...helpers,
        })
      )
    )

    this.getPages = () =>
      pendingList.subscribe().then(() => pagesDataKeeper.toPagesData())

    this.close = () => watchers.forEach((w) => w.close())

    function watchFiles({
      baseDir,
      globs = ['**/*'],
      fileHandler = defaultFileHandler,
      ignored = [],
    }: {
      baseDir: string
      globs?: string | string[]
      fileHandler?: FileHandler
      ignored?: string[]
    }) {
      // Strip trailing slash and make absolute
      baseDir = path.resolve(pagesDir, baseDir)

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
            ignored: ['**/node_modules/**/*', '**/.git/**', ...ignored],
          })
          .on('add', handleFileChange)
          .on('change', handleFileChange)
          .on('unlink', handleFileUnLink)
          .on('ready', () => fsScanFinish())
      )

      async function handleFileChange(filePath: string) {
        filePath = path.join(baseDir, filePath)
        const file =
          fileCache[filePath] ||
          (fileCache[filePath] = new File(filePath, baseDir))
        file.content = null
        pendingList.addPending(
          updateBuffer.batchUpdate(async (scheduleUpdate) => {
            const handlerAPI = pagesDataKeeper.createAPIForSourceFile(
              file,
              scheduleUpdate
            )
            await fileHandler(file, handlerAPI)
          })
        )
      }

      function handleFileUnLink(filePath: string) {
        filePath = path.join(baseDir, filePath)
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

export interface FindPages {
  (pagesDir: string, helpers: PageHelpers): void | Promise<void>
}

export interface PageHelpers extends HanlderAPI {
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
   * set page data in the file handler,
   * and file deletion will be handled automatically
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
    return path.relative(this.base, this.path)
  }

  get extname() {
    return path.extname(this.path).slice(1)
  }

  read() {
    return this.content || (this.content = fs.readFile(this.path, 'utf-8'))
  }
}

export interface FileHandler {
  (file: File, api: HanlderAPI): void | Promise<void>
}

type WatchFilesHelper = (opts: {
  baseDir: string
  globs?: string | string[] | undefined
  fileHandler?: FileHandler | undefined
  ignored?: string[] | undefined
}) => void

interface FileCache {
  [filePath: string]: File
}
