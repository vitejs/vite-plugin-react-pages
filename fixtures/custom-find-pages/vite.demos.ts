import type { UserConfig } from 'vite'
import * as vpr from 'vite-plugin-react'
import pages, {
  findPagesFromGlob,
  defaultFindPages,
} from 'vite-plugin-react-pages'
import mdx from 'vite-plugin-mdx'
import * as path from 'path'

const pagesDir = path.join(__dirname, 'demos')

module.exports = {
  jsx: 'react',
  plugins: [
    vpr,
    mdx(),
    pages(pagesDir, async (helpers) => {
      const demos = path.join(__dirname, 'src')
      const title: { [publicPath: string]: string } = {}
      let pages = await findPagesFromGlob(
        demos,
        '*/demos/**/*.{[tj]sx,md?(x)}',
        async (filePath) => {
          const relative = path.relative(demos, filePath)
          const match = relative.match(/(.*)\/demos\/(.*)\.([tj]sx|mdx?)$/)
          if (!match) throw new Error('unexpected file: ' + filePath)
          const [_, componentName, demoPath] = match
          const publicPath = `/${componentName}`
          title[publicPath] = componentName + ' Title'
          return {
            publicPath,
            staticData: {
              ...(await helpers.extractStaticData(filePath)),
              demoPath,
            },
          }
        }
      )
      pages = pages.map((pageData) => {
        if (!pageData.staticData.isComposedPage) return pageData
        return {
          ...pageData,
          staticData: {
            ...pageData.staticData,
            title: title[pageData.publicPath],
          },
        }
      })
      const defaultPages = await defaultFindPages(pagesDir, helpers)
      return [...defaultPages, ...pages]
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
