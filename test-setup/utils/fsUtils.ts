import fs from 'fs-extra'
import path from 'node:path'

const workspaceRoot = path.resolve(__dirname, '../../')
const playgroundDir = path.resolve(workspaceRoot, 'packages/playground/')
const playgroundTempDir = path.resolve(
  workspaceRoot,
  'packages/playground-temp'
)

/**
 * some tests will modify playground files in order to test hmr.
 * so we make a copy of the tested playground.
 */
export async function setupActualTestPlayground(
  playgroundName: string,
  key: string
) {
  const copyFrom = path.resolve(playgroundDir, playgroundName)
  const copyTo = path.resolve(playgroundTempDir, `${playgroundName}-${key}`)
  await fs.ensureDir(copyTo)
  await fs.emptyDir(copyTo)
  await fs.copy(copyFrom, copyTo, {
    dereference: false,
    filter(file) {
      file = file.replace(/\\/g, '/')
      return !file.includes('__tests__')
    },
  })
  return { playgroundPath: copyTo, restore }

  async function restore(subPath: string = 'pages') {
    await fs.copy(
      path.resolve(copyFrom, subPath),
      path.resolve(copyTo, subPath),
      {
        dereference: false,
        filter(file) {
          file = file.replace(/\\/g, '/')
          return !file.includes('__tests__')
        },
      }
    )
  }
}

export function getFsUtils(testDir: string) {
  return {
    readFile,
    editFile,
    addFile,
    removeFile,
  }

  function readFile(filename: string): string {
    return fs.readFileSync(path.resolve(testDir, filename), 'utf-8')
  }

  function editFile(filename: string, replacer: (str: string) => string): void {
    filename = path.resolve(testDir, filename)
    const content = fs.readFileSync(filename, 'utf-8')
    const modified = replacer(content)
    fs.writeFileSync(filename, modified)
  }

  function addFile(filename: string, content: string): void {
    fs.writeFileSync(path.resolve(testDir, filename), content)
  }

  function removeFile(filename: string): void {
    fs.unlinkSync(path.resolve(testDir, filename))
  }
}
