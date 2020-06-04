import glob from 'glob'

export async function findPages(root: string) {
  const dirPages: string[] = await new Promise((resolve, reject) => {
    glob(
      '**/*$/',
      {
        cwd: root,
        ignore: '**/node_modules/**/*',
      },
      async (err, res) => {
        if (err) reject(err)
        const pages = await Promise.all(
          res.map((pageDir) => {
            const pagePath = pageDir.slice(0, -2)
            return pagePath
          })
        )
        resolve(pages)
      }
    )
  })
  const filePages: string[] = await new Promise((resolve, reject) => {
    glob(
      '**/*$.@(md|mdx|js|jsx|ts|tsx)',
      {
        cwd: root,
        ignore: '**/node_modules/**/*',
        nodir: true,
      },
      (err, res) => {
        if (err) reject(err)
        const pages = res.map((filePath) => {
          const pagePath = filePath.replace(/\$\.(md|mdx|js|jsx|ts|tsx)$/, '')
          return pagePath
        })
        resolve(pages)
      }
    )
  })
  const pages = [...dirPages, ...filePages]
  return pages
}
