import * as fs from 'fs-extra'
import { extract, parse } from 'jest-docblock'
import grayMatter from 'gray-matter'
import { defaultFindPageFiles } from './find-pages-strategy/default'

export type IPageFile = {
  publicPath: string
  filePath: string
  staticData?: any
}
export type IPageFiles = IPageFile[]

export type IPagesData = {
  publicPath: string
  loadPath: string
  staticData: any
}[]

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
    pageFiles.map(async ({ publicPath, filePath, staticData }) => {
      const finalStaticData = {
        // findPageFiles can give staticData to the pages it found
        ...staticData,
        ...(await extractStaticData(filePath)),
        _path: publicPath,
      }
      let loadPath = fileToRequest(filePath)
      return {
        publicPath,
        staticData: finalStaticData,
        loadPath,
      }
    })
  )
}

export async function renderPagesDataDynamic(pagesData: IPagesData) {
  const addPagesData = pagesData.map(
    ({ publicPath: pagePath, staticData, loadPath }) => {
      return `
pages["${pagePath}"] = {
    _importFn: () => wrap(import("${loadPath}?isPageEntry=${pagePath}")),
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
      // import page data and theme data statically
      return `
import * as page${index} from "${loadPath}?isPageEntry=${pagePath}";
ssrData["${pagePath}"] = page${index};`
    }
  )
  return `
export const ssrData = {};
${codeLines.join('\n')}
`
}

async function extractStaticData(pageFilePath: string) {
  const pageCode = await fs.readFile(pageFilePath, 'utf-8')
  if (/\.mdx?/.test(pageFilePath)) {
    const { data: frontmatter } = grayMatter(pageCode)
    return { ...frontmatter, sourceType: 'md' }
  } else {
    return { ...parse(extract(pageCode)), sourceType: 'js' }
  }
}
