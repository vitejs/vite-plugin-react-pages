import invariant from 'tiny-invariant'
import findUp from 'find-up'
import * as path from 'path'

export async function resolvePageLayout(
  pageFilePath: string,
  pagesDirPath: string
) {
  invariant(pageFilePath)
  let currentCwd = path.dirname(pageFilePath)
  // console.log('pageFile', pageFile)
  // console.log('pagesDirPath', pagesDirPath)
  const result = await findUp(
    ['_layout.js', '_layout.ts', '_layout.jsx', '_layout.tsx'],
    {
      type: 'file',
      cwd: currentCwd,
    }
  )
  // console.log('config path:', result)
  if (!result || !isInDir(result, pagesDirPath)) {
    throw new Error('no layout for page: ' + pageFilePath)
  }
  return result
}

function isInDir(p: string, dir: string) {
  return path.normalize(p).startsWith(path.normalize(dir))
}
