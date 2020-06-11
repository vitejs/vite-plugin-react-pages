import globby from 'globby'
import * as path from 'path'

export async function resolvePageFile(
  pagePath: string,
  root: string
): Promise<string> {
  // remove starting slash
  pagePath = pagePath.slice(1)
  const matchFile = globby(`${pagePath}$.{md,mdx,js,jsx,ts,tsx}`, {
    cwd: root,
    ignore: ['**/node_modules/**/*'],
    onlyFiles: true,
  })
  // pagePath may be ''
  const matchDirIndex = pagePath
    ? globby(`${pagePath}/index$.{md,mdx,js,jsx,ts,tsx}`, {
        cwd: root,
        ignore: ['**/node_modules/**/*'],
        onlyFiles: true,
      })
    : globby(`index$.{md,mdx,js,jsx,ts,tsx}`, {
        cwd: root,
        ignore: ['**/node_modules/**/*'],
        onlyFiles: true,
      })
  const [filePages, dirPages] = await Promise.all([matchFile, matchDirIndex])
  const matches = [...filePages, ...dirPages]
  if (matches.length > 1) {
    throw new Error(`there are multi files matching the page "${pagePath}"`)
  }
  if (matches.length === 0) {
    throw new Error(`there are no file matching the page "${pagePath}"`)
  }
  return path.join(root, matches[0])
}
