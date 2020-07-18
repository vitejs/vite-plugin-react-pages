import * as fs from 'fs-extra'
import * as path from 'path'
import { extract, parse } from 'jest-docblock'
import grayMatter from 'gray-matter'
import { defaultFindPages } from './find-pages-strategy/default'
import { parseUrl, stringifyUrl } from 'query-string'

export type IPageData = {
  publicPath: string
  /**
   * If filePath is an array, then this is a composed page.
   * The page data is composed by these files.
   */
  filePath: string | string[]
  staticData?: any
}

export type IPageDataFinal = {
  publicPath: string
  loadPath: string
  staticData: any
}

export interface IFindPagesHelpers {
  readFile: (filePath: string) => Promise<string>
  extractStaticData: (
    filePath: string
  ) => Promise<{
    [key: string]: any
    sourceType: string
  }>
}

export async function collectPagesData(
  pagesDir: string,
  fileToRequest: (file: string) => string,
  findPageFiles?: (helpers: IFindPagesHelpers) => Promise<IPageData[]>
): Promise<IPageDataFinal[]> {
  let pageFiles: IPageData[]
  const findPagesHelpers = createFindPagesHelpers()
  if (typeof findPageFiles === 'function') {
    pageFiles = await findPageFiles(findPagesHelpers)
  } else {
    pageFiles = await defaultFindPages(pagesDir, findPagesHelpers)
  }
  return Promise.all(
    pageFiles.map(async (pageFile) => {
      const { publicPath, staticData, filePath } = pageFile
      if (Array.isArray(filePath)) {
        // composed page
        const loadPath = stringifyUrl({
          url: '/@generated/mergeModules',
          query: {
            modules: filePath.map(fileToRequest),
          },
        })
        return {
          publicPath,
          staticData,
          loadPath,
        }
      } else {
        const loadPath = fileToRequest(filePath)
        return {
          publicPath,
          staticData,
          loadPath,
        }
      }
    })
  )
}

export async function renderPagesDataDynamic(pagesData: IPageDataFinal[]) {
  const addPagesData = pagesData.map(
    ({ publicPath: pagePath, staticData, loadPath }) => {
      const parsed = parseUrl(loadPath)
      parsed.query.isPageEntry = pagePath
      const actualLoadPath = stringifyUrl(parsed)
      return `
pages["${pagePath}"] = {
    _importFn: () => wrap(import("${actualLoadPath}")),
    staticData: ${JSON.stringify(staticData)}
};`
    }
  )

  return `
function wrap(promise) {
  return promise.then((pageData) => ({pageData}));
}

const pages = {};
${addPagesData.join('\n')}
export default pages;
`
}

export async function renderSSRPagesData(pagesData: IPageDataFinal[]) {
  const codeLines = pagesData.map(
    ({ publicPath: pagePath, loadPath }, index) => {
      const parsed = parseUrl(loadPath)
      parsed.query.isPageEntry = pagePath
      const actualLoadPath = stringifyUrl(parsed)
      // import page data and theme data statically
      return `
import * as page${index} from "${actualLoadPath}";
ssrData["${pagePath}"] = page${index};`
    }
  )
  return `
export const ssrData = {};
${codeLines.join('\n')}
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
      throw new Error(`unexpected type "${extname}"`)
  }
}

function createFindPagesHelpers(): IFindPagesHelpers {
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
  return {
    readFile: readFileWithCache,
    extractStaticData: extractStaticDataWithCache,
  }
}
