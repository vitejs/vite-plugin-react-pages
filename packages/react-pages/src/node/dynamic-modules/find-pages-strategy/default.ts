import { globFind } from './utils'
import type { IFindPagesHelpers, IPageData } from '../pages'

export async function defaultFindPages(
  pagesDirPath: string,
  findPagesHelpers: IFindPagesHelpers
): Promise<IPageData[]> {
  const pages = await globFind(pagesDirPath, '**/*$.{md,mdx,js,jsx,ts,tsx}')

  return Promise.all(
    pages.map(async ({ relative, absolute }) => {
      const pagePublicPath = getPagePublicPath(relative)
      return {
        pageId: pagePublicPath,
        dataPath: absolute,
        staticData: await findPagesHelpers.extractStaticData(absolute),
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

  // turn [id] into :id
  // so that react-router can recognize it as url params
  pagePublicPath = pagePublicPath.replace(
    /\[(.*?)\]/g,
    (_, paramName) => `:${paramName}`
  )

  return pagePublicPath
}
