/* eslint-disable @typescript-eslint/no-misused-promises */
import glob from 'glob'
import invariant from 'tiny-invariant'
import * as fs from 'fs-extra'
import * as path from 'path'

export async function resolvePageFile(
  pagePath: string,
  root: string
): Promise<null | string> {
  const filePagePromise = new Promise<null | string>((resolve, reject) => {
    glob(
      `${pagePath}$.@(md|mdx|js|jsx|ts|tsx)`,
      {
        cwd: root,
        ignore: '**/node_modules/**/*',
        nodir: true,
      },
      (err, res) => {
        if (err) reject(err)
        invariant(
          res.length <= 1,
          `pagePath "${pagePath}" should have one index file.`
        )
        if (res.length === 0) {
          resolve(null)
          return
        }
        const absPath = path.join(root, res[0])
        resolve(absPath)
      }
    )
  })
  const dirPagePromise = new Promise<null | string>((resolve, reject) => {
    glob(
      `${pagePath}$/`,
      {
        cwd: root,
        ignore: '**/node_modules/**/*',
      },
      async (err, res) => {
        if (err) reject(err)
        invariant(
          res.length <= 1,
          `pagePath "${pagePath}" should have one index file.`
        )
        if (res.length === 0) {
          resolve(null)
          return
        }
        const pageDirAbs = path.join(root, res[0])
        const indexFile = await resolveDirIndexFile(pageDirAbs)
        resolve(indexFile)
      }
    )
  })
  const [filePage, dirPage] = await Promise.all([
    filePagePromise,
    dirPagePromise,
  ])
  invariant(
    filePage || dirPage,
    `pagePath "${pagePath}" have neither filePage or dirPage`
  )
  invariant(
    !(filePage && dirPage),
    `pagePath "${pagePath}" have either filePage or dirPage`
  )
  return filePage || dirPage
}

async function resolveDirIndexFile(dir: string) {
  const indexs = (await fs.readdir(dir)).filter((filePath) =>
    /index\.(md|mdx|js|jsx|ts|tsx)$/.test(filePath)
  )
  invariant(
    indexs.length === 1,
    `Directory "${dir}" should contain one index file.`
  )
  const index = path.join(dir, indexs[0])
  return index
}
