import * as fs from 'fs-extra'
import * as path from 'path'
import { extract, parse } from 'jest-docblock'
import grayMatter from 'gray-matter'
import { defaultStrategy } from './find-pages-strategy/default'
import { globFind, PagePath } from './find-pages-strategy/utils'
import slash from 'slash'
import chokidar, { FSWatcher } from 'chokidar'

export interface FindPagesHelpers {
  /**
   * readFile util with cache
   */
  readonly readFile: (filePath: string) => Promise<string>
  /**
   * Read the static data from a file.
   */
  readonly extractStaticData: (
    filePath: string
  ) => Promise<{
    readonly [key: string]: any
    readonly sourceType: string
  }>
  /**
   * Glob utils. Return matched file paths.
   *
   * Globs are automatically watched for changes.
   */
  readonly globFind: (baseDir: string, glob: string) => Promise<PagePath[]>
  /**
   * Use the basic filesystem routing convention to find pages.
   */
  readonly findPages: (pagesDir: string) => Promise<PagePath[]>
  /**
   * Load page data using the default page loader.
   */
  readonly loadPageData: (pagePath: PagePath) => Promise<PageData>
  /**
   * Register page data manually.
   *
   * Calling this is only necessary for pages not found using
   * the `globFind` function.
   */
  readonly addPageData: (pageData: PageData) => void
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

export async function renderPageList(pagesData: FindPagesResult) {
  const addPagesData = Object.entries(pagesData).map(
    ([pageId, { staticData }]) => {
      let subPath = pageId
      if (subPath === '/') {
        // import("@!virtual-modules/pages/") would make vite confused
        // so we change the sub path
        subPath = '/__index'
      }
      const code = `
pages["${pageId}"] = {};
pages["${pageId}"].data = () => import("@!virtual-modules/pages${subPath}");
pages["${pageId}"].staticData = ${JSON.stringify(staticData)};`
      return code
    }
  )
  return `
const pages = {};
${addPagesData.join('\n')}
export default pages;
`
}

export async function renderPageListInSSR(pagesData: FindPagesResult) {
  const addPagesData = Object.entries(pagesData).map(
    ([pageId, { staticData }], index) => {
      let subPath = pageId
      if (subPath === '/') {
        // import("@!virtual-modules/pages/") would make vite confused
        // so we change the sub path
        subPath = '/__index'
      }
      const code = `
pages["${pageId}"] = {};
import page${index} from "@!virtual-modules/pages${subPath}";
pages["${pageId}"] = page${index};`
      return code
    }
  )
  return `
const pages = {};
${addPagesData.join('\n')}
export default pages;
`
}

export function renderOnePageData(onePageData: { [dataKey: string]: string }) {
  const importModule = Object.entries(onePageData).map(
    ([dataKey, path], idx) => `
import * as m${idx} from "${slash(path)}";
modules["${dataKey}"] = m${idx};`
  )
  return `
  const modules = {};
  ${importModule.join('\n')}
  export default modules;`
}

export async function extractStaticData(
  fileContent: string,
  extname: string
): Promise<{ sourceType: string; [key: string]: any }> {
  switch (extname) {
    case 'md':
    case 'mdx':
      const { data: frontmatter } = grayMatter(fileContent)
      return { ...frontmatter, sourceType: 'md' }
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return { ...parse(extract(fileContent)), sourceType: 'js' }
    default:
      throw new Error(`unexpected extension name "${extname}"`)
  }
}

export interface PageFinder {
  readonly results: Promise<PageCache>
  close(): void
}

export function getPageFinder(
  pagesDir: string,
  {
    findPages = defaultStrategy.findPages,
    loadPageData = defaultStrategy.loadPageData,
  }: PageStrategy = {}
): PageFinder {
  const pageCache: PageCache = {}
  const fileCache: FileCache = {}
  const watchers: WatcherCache = {}

  const readFileWithCache = async (filePath: string) => {
    if (fileCache[filePath]) return fileCache[filePath]
    fileCache[filePath] = fs.readFile(filePath, 'utf-8')
    return fileCache[filePath]
  }

  const addPageData = (pageData: PageData) => {
    if (!pageData.pageId.startsWith('/')) {
      throw new Error(
        `addPageData error: pageId should starts with "/", but got "${pageData.pageId}"`
      )
    }
    let exist = pageCache[pageData.pageId]
    if (!exist) {
      exist = pageCache[pageData.pageId] = {
        data: {},
        staticData: {},
      }
    }
    const key = pageData.key ?? 'main'
    if (pageData.dataPath) {
      if (exist.data[key]) {
        throw new Error(
          `addPageData conflict: data with key "${key}" already exist. Please give this data another key.`
        )
      }
      exist.data[key] = pageData.dataPath
    }
    if (pageData.staticData) {
      if (exist.staticData[key]) {
        throw new Error(
          `addPageData conflict: staticData with key "${key}" already exist. Please give this staticData another key.`
        )
      }
      exist.staticData[key] = pageData.staticData
    }
  }

  const pageIdByFilePath: { [filePath: string]: string } = {}
  const watchFiles = (baseDir: string, glob: string) => {
    // Strip trailing slash and make absolute
    baseDir = path.resolve(baseDir)

    let watcher = watchers[baseDir]
    if (!watcher) {
      const reloadPageData = async (filePath: string) => {
        const relative = filePath.slice(baseDir.length + 1)
        const pageData = await loadPageData(
          { relative, absolute: filePath },
          helpers
        )
        pageIdByFilePath[filePath] = pageData.pageId
        addPageData(pageData)
      }

      watchers[baseDir] = watcher = chokidar.watch([], {
        cwd: baseDir,
        ignored: ['**/node_modules/**/*'],
        ignoreInitial: true,
      })

      watcher
        .on('add', async (filePath) => {
          filePath = path.join(baseDir, filePath)
          addResult(reloadPageData(filePath))
        })
        .on('change', async (filePath) => {
          filePath = path.join(baseDir, filePath)
          delete fileCache[filePath]
          const oldPageId = pageIdByFilePath[filePath]
          if (oldPageId) delete pageCache[oldPageId]
          addResult(reloadPageData(filePath))
        })
        .on('unlink', (filePath) => {
          filePath = path.join(baseDir, filePath)
          const pageId = pageIdByFilePath[filePath]
          delete pageIdByFilePath[filePath]
          delete pageCache[pageId]
        })
    }
    watcher.add(glob)
  }

  const helpers: FindPagesHelpers = {
    readFile: readFileWithCache,
    extractStaticData: async (filePath) =>
      extractStaticData(
        await readFileWithCache(filePath),
        path.extname(filePath).slice(1)
      ),
    findPages: (pagesDir) =>
      defaultStrategy.findPages(pagesDir, helpers) as Promise<PagePath[]>,
    loadPageData: (pagePath) =>
      defaultStrategy.loadPageData(pagePath, helpers) as Promise<PageData>,
    addPageData,
    async globFind(baseDir, glob) {
      const paths = await globFind(baseDir, glob)
      watchFiles(baseDir, glob)
      return paths
    },
  }

  // The results promise is replaced as pages are added/changed/deleted.
  let results = Promise.resolve(findPages(pagesDir, helpers)).then(
    async (pagePaths) => {
      if (pagePaths) {
        const pageData = await Promise.all(
          pagePaths.map((pagePath) => loadPageData(pagePath, helpers))
        )
        pageData.forEach((pageData, i) => {
          pageIdByFilePath[pagePaths[i].absolute] = pageData.pageId
          addPageData(pageData)
        })
      }
      return pageCache
    }
  )

  // Ensure file changes are processed before resolving the results.
  const addResult = (result: Promise<void>) =>
    (results = Promise.all([results, result]).then(() => pageCache))

  return {
    get results() {
      return results
    },
    close() {
      Object.values(watchers).forEach((watcher) => watcher.close())
    },
  }
}

export interface PageStrategy {
  findPages?: (
    pagesDir: string,
    helpers: FindPagesHelpers
  ) => PagePath[] | Promise<PagePath[] | undefined> | undefined
  loadPageData?: (
    pagePath: PagePath,
    helpers: FindPagesHelpers
  ) => PageData | Promise<PageData>
}

export interface FindPagesResult {
  readonly [pageId: string]: {
    readonly data: {
      readonly [key: string]: string
    }
    readonly staticData: {
      readonly [key: string]: any
    }
  }
}

interface PageCache {
  [pageId: string]: {
    data: {
      [key: string]: string
    }
    staticData: {
      [key: string]: any
    }
  }
}

interface FileCache {
  [filePath: string]: Promise<string>
}

interface WatcherCache {
  [cwd: string]: FSWatcher
}
