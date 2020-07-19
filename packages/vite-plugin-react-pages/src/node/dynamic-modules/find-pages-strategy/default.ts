import * as path from 'path'
import { IPageData, IFindPagesHelpers } from '../pages'
import { findPagesFromGlob } from './fromGlob'

export async function defaultFindPages(
  pagesDirPath: string,
  findPagesHelpers: IFindPagesHelpers
): Promise<IPageData[]> {
  const pages = findPagesFromGlob(
    pagesDirPath,
    '**/*$.{md,mdx,js,jsx,ts,tsx}',
    async (pageFilePath) => {
      const relativePageFilePath = path.relative(pagesDirPath, pageFilePath)
      const publicPath = getPagePublicPath(relativePageFilePath)
      return {
        publicPath,
        filePath: pageFilePath,
        staticData: await findPagesHelpers.extractStaticData(pageFilePath),
      }
    }
  )
  return pages
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
