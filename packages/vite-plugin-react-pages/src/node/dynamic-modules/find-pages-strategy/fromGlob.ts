import globby from 'globby'
import * as path from 'path'
import { IPageFile } from '../pages'

export async function findPagesFromGlob(
  baseDir: string,
  glob: string,
  pageInfo: (
    file: string
  ) => Pick<IPageFile, 'publicPath' | 'staticData'> | false
): Promise<IPageFile[]> {
  const pageFiles: string[] = await globby(glob, {
    cwd: baseDir,
    ignore: ['**/node_modules/**/*'],
    onlyFiles: true,
  })

  const pages = pageFiles
    .map((file) => {
      const info = pageInfo(file)
      if (!info) return false
      return {
        ...info,
        filePath: path.join(baseDir, file),
      } as IPageFile
    })
    .filter<IPageFile>(Boolean as any)

  return pages
}
