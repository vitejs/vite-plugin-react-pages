import type { UserConfig } from 'vite'
import * as vpr from 'vite-plugin-react'
import pages, {
  findPagesFromGlob,
  IPageFile,
  extractStaticData,
} from 'vite-plugin-react-pages'
import mdx from 'vite-plugin-mdx'
import * as path from 'path'
import * as fs from 'fs-extra'

const pagesDir = path.join(__dirname, 'demos')

module.exports = {
  jsx: 'react',
  plugins: [
    vpr,
    mdx(),
    pages(pagesDir, async () => {
      const baseDir = path.join(__dirname, 'src')
      const pages = await findPagesFromGlob(
        baseDir,
        '*/demos/**/*.{[tj]sx,md?(x)}',
        async (file) => {
          const match = file.match(/(.*)\/demos\/(.*)\.([tj]sx|mdx?)$/)
          if (!match) throw new Error('unexpected file: ' + file)
          const [_, componentName, demoPath] = match

          return {
            publicPath: `/${componentName}`,
            staticData: {
              componentName,
              demoPath,
              ...(await extractStaticData(
                await fs.readFile(path.join(baseDir, file), 'utf-8'),
                /\.mdx?/.test(file) ? 'md' : 'js'
              )),
            },
          }
        }
      )

      // clusters according to componentName
      const clusters: {
        [componentName: string]: IPageFile[]
      } = {}

      pages.forEach((page) => {
        const mergedPage = clusters[page.staticData.componentName]
        if (mergedPage) {
          mergedPage.push(page)
        } else {
          clusters[page.staticData.componentName] = [page]
        }
      })

      const mergedPages = Object.entries(clusters).map(([_, oneCluster]) => {
        if (oneCluster.length == 1) {
          return oneCluster[0]
        }
        return {
          publicPath: oneCluster[0].publicPath,
          filePath: oneCluster.map(({ filePath }) => filePath as string),
          staticData: {
            componentName: oneCluster[0].staticData.componentName,
            isMergedPage: true,
            files: oneCluster.map(({ staticData }) => staticData),
          },
        }
      })

      return mergedPages
    }),
  ],
  alias: {
    'my-lib': '/src',
  },
  optimizeDeps: {
    link: ['vite-pages-theme-basic'],
  },
  minify: false,
} as UserConfig

function ensureArray(v: any) {
  return Array.isArray(v) ? v : [v]
}
