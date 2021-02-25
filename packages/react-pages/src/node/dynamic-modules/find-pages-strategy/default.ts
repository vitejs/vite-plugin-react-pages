import type { PageStrategy } from '../pages'

export const defaultStrategy: Required<PageStrategy> = {
  findPages: (pagesDirPath, { globFind }) =>
    globFind(pagesDirPath, '**/*$.{md,mdx,js,jsx,ts,tsx}'),
  async loadPageData({ relative, absolute }, { extractStaticData }) {
    const pagePublicPath = getPagePublicPath(relative)
    return {
      pageId: pagePublicPath,
      dataPath: absolute,
      staticData: await extractStaticData(absolute),
    }
  },
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
