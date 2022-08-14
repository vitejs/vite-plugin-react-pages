import { PageStrategy } from '..'
import { extractStaticData, File } from '../../utils/virtual-module'
import type { FileHandler, FindPages } from '../types.doc'

export class DefaultPageStrategy extends PageStrategy {
  constructor(
    opts: { extraFindPages?: FindPages; fileHandler?: FileHandler } = {}
  ) {
    const { extraFindPages, fileHandler = defaultFileHandler } = opts
    // pass a wrapped findPages function to super class
    super((pagesDir, helpersFromParent) => {
      // we can create our own helpers, providing a default fileHandler
      // and not using helpersFromParent
      const helpers = this.createHelpers(fileHandler)
      helpers.watchFiles(pagesDir, '**/*$.{md,mdx,js,jsx,ts,tsx}')
      if (typeof extraFindPages === 'function') {
        extraFindPages(pagesDir, helpers)
      }
    })
  }
}

/**
 * The defaultFileHandler return the result to caller,
 * instead of directly setting the pageData object.
 * so that it is more useful to users.
 */
export const defaultFileHandler: FileHandler = async (file: File, api) => {
  const pagePublicPath = getPagePublicPath(file.relative)
  return {
    pageId: pagePublicPath,
    dataPath: file.path,
    staticData: await extractStaticData(file),
  }
}

/**
 * turn `sub-path/page2/index.tsx` into `/sub-path/page2`
 */
export function getPagePublicPath(relativePageFilePath: string) {
  let pagePublicPath = relativePageFilePath.replace(
    /\$\.(md|mdx|js|jsx|ts|tsx)$/,
    ''
  )
  pagePublicPath = pagePublicPath.replace(/index$/, '')
  // remove trailing slash
  pagePublicPath = pagePublicPath.replace(/\/$/, '')
  // ensure starting slash
  pagePublicPath = pagePublicPath.replace(/^\//, '')
  pagePublicPath = `/${pagePublicPath}`

  // turn [id] into :id
  // so that react-router can recognize it as url params
  pagePublicPath = pagePublicPath.replace(
    /\[(.*?)\]/g,
    (_, paramName) => `:${paramName}`
  )

  return pagePublicPath
}
