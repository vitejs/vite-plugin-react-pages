import * as fs from 'fs-extra'
import * as path from 'path'

export async function resolveTheme(pagesDirPath: string) {
  for (let filename of ['_theme.js', '_theme.ts', '_theme.jsx', '_theme.tsx']) {
    filename = path.join(pagesDirPath, filename)
    if (await fs.pathExists(filename)) {
      return filename
    }
  }
  throw new Error("can't find theme inside pagesDir: " + pagesDirPath)
}
