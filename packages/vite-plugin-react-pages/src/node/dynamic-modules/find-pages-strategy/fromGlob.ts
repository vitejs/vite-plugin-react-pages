import globby from 'globby'
import * as path from 'path'
import { IPageFile } from '../pages'

type IPageInfo = Pick<IPageFile, 'publicPath' | 'staticData'> | false

export async function findPagesFromGlob(
  baseDir: string,
  glob: string,
  pageInfo: (file: string) => IPageInfo | Promise<IPageInfo>
): Promise<IPageFile[]> {
  const pageFiles: string[] = await globby(glob, {
    cwd: baseDir,
    ignore: ['**/node_modules/**/*'],
    onlyFiles: true,
  })

  const pages = (
    await Promise.all(
      pageFiles.map(async (file) => {
        const info = await pageInfo(file)
        if (!info) return false
        return {
          ...info,
          filePath: path.join(baseDir, file),
        } as IPageFile
      })
    )
  ).filter<IPageFile>(Boolean as any)

  return pages
}
