import globby from 'globby'
import * as path from 'path'
import { IPageData } from '../pages'

export type IPageInfo =
  | {
      publicPath: string
      staticData?: any
    }
  | false

export async function findPagesFromGlob(
  baseDir: string,
  glob: string,
  pageInfo: (relativePath: string) => IPageInfo | Promise<IPageInfo>
): Promise<IPageData[]> {
  const pageFiles: string[] = await globby(glob, {
    cwd: baseDir,
    ignore: ['**/node_modules/**/*'],
    onlyFiles: true,
  })

  const pages = (
    await Promise.all(
      pageFiles.map(async (file) => {
        const filePath = path.join(baseDir, file)
        const info = await pageInfo(filePath)
        if (!info) return false
        return {
          ...info,
          filePath,
        } as IPageData
      })
    )
  ).filter<IPageData>(Boolean as any)

  // merge pages with same publicPath
  const buckets: {
    [publicPath: string]: IPageData[]
  } = {}
  pages.forEach((page) => {
    const bucket = buckets[page.publicPath]
    if (bucket) {
      bucket.push(page)
    } else {
      buckets[page.publicPath] = [page]
    }
  })
  const mergedPages = Object.entries(buckets).map(([publicPath, bucket]) => {
    if (bucket.length == 1) {
      return bucket[0]
    }
    return {
      publicPath: publicPath,
      filePath: bucket.map(({ filePath }) => filePath as string),
      staticData: {
        isComposedPage: true,
        parts: bucket.map(({ staticData }) => staticData),
      },
    }
  })

  return mergedPages
}
