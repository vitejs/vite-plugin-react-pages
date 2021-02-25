import globby from 'globby'
import * as path from 'path'

export interface PagePath {
  readonly relative: string
  readonly absolute: string
}

export async function globFind(
  baseDir: string,
  glob: string
): Promise<PagePath[]> {
  const pageFiles: string[] = await globby(glob, {
    cwd: baseDir,
    ignore: ['**/node_modules/**/*'],
    onlyFiles: true,
  })

  return pageFiles.map((relative) => {
    const absolute = path.join(baseDir, relative)
    return { relative, absolute }
  })
}
