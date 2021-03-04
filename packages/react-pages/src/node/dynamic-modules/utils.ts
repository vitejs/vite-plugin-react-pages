import { extract, parse } from 'jest-docblock'
import grayMatter from 'gray-matter'
import { File, FindPages, PageData } from './PageStrategy'

export const defaultPageFinder: FindPages = (pagesDir, { watchFiles }) =>
  watchFiles(pagesDir, '**/*$.{md,mdx,js,jsx,ts,tsx}')

export const defaultPageLoader = async (file: File): Promise<PageData> => {
  const pagePublicPath = getPagePublicPath(file.relative)
  return {
    pageId: pagePublicPath,
    dataPath: file.path,
    staticData: await extractStaticData(file),
  }
}

export async function extractStaticData(
  file: File
): Promise<{ sourceType: string; [key: string]: any }> {
  switch (file.extname) {
    case 'md':
    case 'mdx':
      const { data: frontmatter } = grayMatter(await file.read())
      return { ...frontmatter, sourceType: 'md' }
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return { ...parse(extract(await file.read())), sourceType: 'js' }
    default:
      throw new Error(`unexpected extension name "${file.extname}"`)
  }
}

export function getPagePublicPath(relativePageFilePath: string) {
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
