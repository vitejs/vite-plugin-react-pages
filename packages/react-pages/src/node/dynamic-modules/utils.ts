import { extract, parse } from 'jest-docblock'
import grayMatter from 'gray-matter'
import { File, FindPages, FileHandler } from './PageStrategy'

export const defaultPageFinder: FindPages = (pagesDir, { watchFiles }) =>
  watchFiles({ baseDir: pagesDir, globs: '**/*$.{md,mdx,js,jsx,ts,tsx}' })

export const defaultFileHandler: FileHandler = async (file: File, api) => {
  const pagePublicPath = getPagePublicPath(file.relative)
  const runtimeData = api.getRuntimeData(pagePublicPath)
  const staticData = api.getStaticData(pagePublicPath)
  runtimeData.main = file.path
  staticData.main = await extractStaticData(file)
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

/**
 * track how many works are pending
 * to avoid returning half-finished page data
 */
export class PendingList {
  private pendingCount = 0
  private subscribers: Array<() => void> = []

  addPending(p: Promise<void>) {
    this.pendingCount++
    p.finally(() => {
      this.pendingCount--
      if (this.pendingCount === 0) {
        // all pending works are finished
        this.subscribers.forEach((notify) => notify())
        this.subscribers.length = 0
      }
    })
  }

  subscribe(): Promise<void> {
    if (this.pendingCount === 0) return Promise.resolve()
    return new Promise((res) => {
      this.subscribers.push(() => {
        res()
      })
    })
  }
}
