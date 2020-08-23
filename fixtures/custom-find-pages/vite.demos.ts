import type { UserConfig } from 'vite'
import * as vpr from 'vite-plugin-react'
import pages from 'vite-plugin-react-pages'
import mdx from 'vite-plugin-mdx'
import * as path from 'path'

module.exports = {
  jsx: 'react',
  plugins: [
    vpr,
    mdx(),
    pages(path.join(__dirname, 'pages'), async (helpers) => {
      const demosBasePath = path.join(__dirname, 'src')
      let demoPaths = await helpers.globFind(
        demosBasePath,
        '*/demos/**/*.{[tj]sx,md?(x)}'
      )

      const pagesByComponent: { [comp: string]: any } = {}
      await Promise.all(
        demoPaths.map(async ({ relative, absolute }) => {
          const match = relative.match(/(.*)\/demos\/(.*)\.([tj]sx|mdx?)$/)
          if (!match) throw new Error('unexpected file: ' + absolute)
          const [_, componentName, demoPath] = match
          const publicPath = `/${componentName}`

          helpers.addPageData({
            pageId: publicPath,
            key: demoPath,
            dataPath: absolute,
            staticData: await helpers.extractStaticData(absolute),
          })

          if (!pagesByComponent[componentName]) {
            pagesByComponent[componentName] = {
              publicPath,
            }
          }
        })
      )

      Object.entries(pagesByComponent).forEach(
        ([componentName, { publicPath }]) => {
          helpers.addPageData({
            pageId: publicPath,
            key: 'title',
            staticData: componentName + ' Title',
          })
        }
      )
      // we also want to collect pages from `/pages` with basic filesystem routing convention
      const defaultPages = await helpers.defaultFindPages(
        path.join(__dirname, 'pages')
      )
      defaultPages.forEach(helpers.addPageData)
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
