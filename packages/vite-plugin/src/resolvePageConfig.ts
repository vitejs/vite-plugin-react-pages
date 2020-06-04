import invariant from 'tiny-invariant'
import findUp from 'find-up'
import * as path from 'path'
import { resolvePageFile } from './resolvePageFile'

export async function resolvePageConfig(
  pagePath: string,
  pagesDirPath: string
) {
  const pageFile = await resolvePageFile(pagePath, pagesDirPath)
  invariant(pageFile)
  const configs: string[] = []
  let currentCwd = path.dirname(pageFile)
  // console.log('pageFile', pageFile)
  // console.log('pagesDirPath', pagesDirPath)
  while (true) {
    // console.log('currentCwd', currentCwd)
    const result = await findUp(['config.js', 'config.ts'], {
      type: 'file',
      cwd: currentCwd,
    })
    // console.log('config path:', result)
    if (!result || !isInDir(result, pagesDirPath)) break
    configs.push(result)
    currentCwd = path.resolve(path.dirname(result), '../')
  }
  return configs
}

function isInDir(p: string, dir: string) {
  return path.normalize(p).startsWith(path.normalize(dir))
}
