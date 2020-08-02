import globby from 'globby'
import * as path from 'path'

export async function globFind(
  baseDir: string,
  glob: string
): Promise<{ relative: string; absolute: string }[]> {
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
