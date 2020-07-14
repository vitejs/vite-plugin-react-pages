import * as fs from 'fs-extra'
import { extract, parse } from 'jest-docblock'
import grayMatter from 'gray-matter'
import globby from 'globby'
import * as path from 'path'

import { resolvePageTheme } from './utils/resolvePageTheme'

export interface IDynamicRoutes {}

export type IPageFiles = {
  publicPath: string
  filePath: string
  themeFilePath: string
}[]

export type IPagesData = {
  publicPath: string
  staticData: any
  themePublicPath: string
  loadPath: string
}[]

export async function collectPagesData(
  findPageFiles: string | (() => Promise<IPageFiles>),
  fileToRequest: (file: string) => string
): Promise<IPagesData> {
  let pageFiles: IPageFiles
  if (typeof findPageFiles === 'function') {
    pageFiles = await findPageFiles()
  } else if (typeof findPageFiles === 'string') {
    pageFiles = await defaultFindPageFiles(findPageFiles)
  } else {
    throw new Error('invalid findPageFiles')
  }
  return Promise.all(
    pageFiles.map(async ({ publicPath, filePath, themeFilePath }) => {
      const staticData = await extractStaticData(filePath)
      const themePublicPath = fileToRequest(themeFilePath)
      let loadPath = fileToRequest(filePath)
      return { publicPath, staticData, themePublicPath, loadPath }
    })
  )
}

export async function renderPagesDataDynamic(pagesData: IPagesData) {
  const addPagesData = pagesData.map(
    (
      { publicPath: pagePath, staticData, themePublicPath, loadPath },
      index
    ) => {
      return `
import theme${index} from "${themePublicPath}";
pages["${pagePath}"] = {
    _importFn: () => wrap(import("${loadPath}?isPageEntry=${pagePath}")),
    staticData: ${JSON.stringify(staticData)},
    theme: theme${index},
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

export async function defaultFindPageFiles(
  pagesDirPath: string
): Promise<IPageFiles> {
  const pageFiles: string[] = await globby('**/*$.{md,mdx,js,jsx,ts,tsx}', {
    cwd: pagesDirPath,
    ignore: ['**/node_modules/**/*'],
    onlyFiles: true,
  })
  return Promise.all(
    pageFiles.map(async (relativePageFilePath) => {
      const pageFilePath = path.join(pagesDirPath, relativePageFilePath)
      const publicPath = getPagePublicPath(relativePageFilePath)
      const themeFilePath = await resolvePageTheme(pageFilePath, pagesDirPath)
      return {
        publicPath,
        filePath: pageFilePath,
        themeFilePath,
      }
    })
  )
}

function getPagePublicPath(relativePageFilePath: string) {
  let pagePublicPath = relativePageFilePath.replace(
    /\$\.(md|mdx|js|jsx|ts|tsx)$/,
    ''
  )
  pagePublicPath = pagePublicPath.replace(/index$/, '')
  // ensure starting slash
  pagePublicPath = pagePublicPath.replace(/\/$/, '')
  pagePublicPath = `/${pagePublicPath}`
  return pagePublicPath
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
