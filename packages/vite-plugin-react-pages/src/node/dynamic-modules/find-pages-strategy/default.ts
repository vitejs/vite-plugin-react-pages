import globby from 'globby'
import * as path from 'path'
import { IPageFiles } from '../pages'

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
      return {
        publicPath,
        filePath: pageFilePath,
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
