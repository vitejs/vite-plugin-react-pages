import * as fs from 'fs-extra'
import { extract, parse } from 'jest-docblock'
import grayMatter from 'gray-matter'
import { defaultFindPageFiles } from './find-pages-strategy/default'
import { parseUrl, stringifyUrl } from 'query-string'

export type IPageFile = {
  publicPath: string
  filePath: string | string[]
  staticData?: any
}

export type IPageFiles = IPageFile[]

export type IPagesData = {
  publicPath: string
  loadPath: string
  staticData: any
}[]

// TODO: support theme to merge multi file data into one page

export async function collectPagesData(
  pagesDir: string,
  fileToRequest: (file: string) => string,
  findPageFiles?: () => Promise<IPageFiles>
): Promise<IPagesData> {
  let pageFiles: IPageFiles
  if (typeof findPageFiles === 'function') {
    pageFiles = await findPageFiles()
  } else {
    pageFiles = await defaultFindPageFiles(pagesDir)
  }
  return Promise.all(
    pageFiles.map(async (pageFile) => {
      const { publicPath, staticData, filePath } = pageFile
      if (Array.isArray(filePath)) {
        // composed page
        const finalStaticData = {
          // findPageFiles can give staticData to the pages it found
          ...staticData,
          _path: publicPath,
        }
        const loadPath = stringifyUrl({
          url: '/@generated/mergeModules',
          query: {
            modules: filePath.map(fileToRequest),
          },
        })
        return {
          publicPath,
          staticData: finalStaticData,
          loadPath,
        }
      } else {
        const finalStaticData = {
          // findPageFiles can give staticData to the pages it found
          ...staticData,
          ...extractStaticData(
            await fs.readFile(filePath, 'utf-8'),
            /\.mdx?/.test(filePath) ? 'md' : 'js'
          ),
          _path: publicPath,
        }
        const loadPath = fileToRequest(filePath)
        return {
          publicPath,
          staticData: finalStaticData,
          loadPath,
        }
      }
    })
  )
}

export async function renderPagesDataDynamic(pagesData: IPagesData) {
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

export async function renderSSRPagesData(pagesData: IPagesData) {
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
  pageCode: string,
  type: 'md' | 'js'
): Promise<{ sourceType: string; [key: string]: any }> {
  if (type === 'md') {
    const { data: frontmatter } = grayMatter(pageCode)
    return { ...frontmatter, sourceType: 'md' }
  } else if (type === 'js') {
    return { ...parse(extract(pageCode)), sourceType: 'js' }
  } else {
    throw new Error(`unexpected type "${type}"`)
  }
}
