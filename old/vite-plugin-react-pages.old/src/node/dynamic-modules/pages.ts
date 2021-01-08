import * as fs from 'fs-extra'
import * as path from 'path'
import { extract, parse } from 'jest-docblock'
import grayMatter from 'gray-matter'
import { defaultFindPages as _defaultFindPages } from './find-pages-strategy/default'
import { parseUrl, stringifyUrl } from 'query-string'
import { globFind } from './find-pages-strategy/utils'

export interface IFindPagesHelpers {
  /**
   * readFile util with cache
   */
  readFile: (filePath: string) => Promise<string>
  /**
   * Read the static data from a file.
   */
  extractStaticData: (
    filePath: string
  ) => Promise<{
    [key: string]: any
    sourceType: string
  }>
  /**
   * Glob utils. Return matched file paths.
   */
  globFind: (
    baseDir: string,
    glob: string
  ) => Promise<
    {
      relative: string
      absolute: string
    }[]
  >
  /**
   * Use the basic filesystem routing convention to find pages.
   */
  defaultFindPages: (baseDir: string) => Promise<IPageData[]>
  /**
   * Register page data.
   * User who custom findPages should use it to register the data he/she finds.
   */
  addPageData: (pageData: IPageData) => void
}

export interface IPageData {
  /**
   * The page route path.
   * User can register multiple page data with same pageId,
   * as long as they have different keys.
   * Page data with same pageId will be merged.
   *
   * @example '/posts/hello-world'
   */
  pageId: string
  /**
   * The data key.
   * If it conflicts with an already-registered data,
   * error will be thrown.
   *
   * @default 'main'
   */
  key?: string
  /**
   * The path to the runtime data module
   */
  dataPath?: string

  staticData?: any
}

export async function collectPagesData(
  pagesDir: string,
  fileToRequest: (file: string) => string,
  findPages?: (helpers: IFindPagesHelpers) => Promise<void>
): Promise<IFindPagesResult> {
  const [pages, findPagesHelpers] = createFindPagesContext()
  if (typeof findPages === 'function') {
    await findPages(findPagesHelpers)
  } else {
    const found = await findPagesHelpers.defaultFindPages(pagesDir)
    found.forEach(findPagesHelpers.addPageData)
  }
  return pages

  // return Promise.all(
  //   pageFiles.map(async (pageFile) => {
  //     const { publicPath, staticData, filePath } = pageFile
  //     if (Array.isArray(filePath)) {
  //       // composed page
  //       const loadPath = stringifyUrl({
  //         url: '@!virtual-modules/mergeModules',
  //         query: {
  //           modules: filePath.map(fileToRequest),
  //         },
  //       })
  //       return {
  //         publicPath,
  //         staticData,
  //         loadPath,
  //       }
  //     } else {
  //       const loadPath = fileToRequest(filePath)
  //       return {
  //         publicPath,
  //         staticData,
  //         loadPath,
  //       }
  //     }
  //   })
  // )
}

export async function renderPagesDataDynamic(pagesData: IFindPagesResult) {
  const addPagesData = Object.entries(pagesData).map(
    ([pageId, { data, staticData }]) => {
      let code = [`pages["${pageId}"] = {};`]
      const mergedModulePath = stringifyUrl({
        url: '@!virtual-modules/mergeModules',
        query: data,
      })
      code.push(
        `pages["${pageId}"].data = () => import("${mergedModulePath}");`
      )
      code.push(
        `pages["${pageId}"].staticData = ${JSON.stringify(staticData)};`
      )
      return code.join('\n')
    }
  )
  return `
const pages = {};
${addPagesData.join('\n')}
export default pages;
`
}

export async function renderSSRPagesData(pagesData: IFindPagesResult) {
  const addPagesData = Object.entries(pagesData).map(
    ([pageId, { data, staticData }], index) => {
      let code = [`pages["${pageId}"] = {};`]
      const mergedModulePath = stringifyUrl({
        url: '@!virtual-modules/mergeModules',
        query: data,
      })
      code.push(`import page${index} from "${mergedModulePath}";`)
      code.push(`pages["${pageId}"] = page${index};`)
      return code.join('\n')
    }
  )
  return `
const pages = {};
${addPagesData.join('\n')}
export default pages;
`
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

function createFindPagesContext(): [IFindPagesResult, IFindPagesHelpers] {
  const result: IFindPagesResult = {}

  const readFileCache: { [filePath: string]: Promise<string> } = {}
  const readFileWithCache = async (filePath: string) => {
    if (readFileCache[filePath]) return readFileCache[filePath]
    readFileCache[filePath] = fs.readFile(filePath, 'utf-8')
    return readFileCache[filePath]
  }
  const extractStaticDataWithCache = async (filePath: string) =>
    extractStaticData(
      await readFileWithCache(filePath),
      path.extname(filePath).slice(1)
    )
  const defaultFindPages = (baseDir: string) =>
    _defaultFindPages(baseDir, helpers)

  const addPageData = (pageData: IPageData) => {
    let exist = result[pageData.pageId]
    if (!exist) {
      exist = result[pageData.pageId] = {
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

  const helpers: IFindPagesHelpers = {
    readFile: readFileWithCache,
    extractStaticData: extractStaticDataWithCache,
    globFind,
    defaultFindPages,
    addPageData,
  }
  return [result, helpers]
}

export interface IFindPagesResult {
  [pageId: string]: {
    data: {
      [key: string]: string
    }
    staticData: {
      [key: string]: any
    }
  }
}
