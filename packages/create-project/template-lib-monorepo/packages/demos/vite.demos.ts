import type { UserConfig } from 'vite'
import * as path from 'path'

import reactRefresh from '@vitejs/plugin-react-refresh'
import mdx from 'vite-plugin-mdx'
import pages from 'vite-plugin-react-pages'

module.exports = {
  jsx: 'react',
  plugins: [
    reactRefresh(),
    mdx(),
    pages({
      findPages: async (helpers) => {
        const pagesByComponent: { [comp: string]: any } = {}
        const demosBasePath = path.join(__dirname, '../')
        // find all demo modules
        let demoPaths = await helpers.globFind(
          demosBasePath,
          '*/demos/**/*.{[tj]sx,md?(x)}'
        )

        await Promise.all(
          demoPaths.map(async ({ relative, absolute }) => {
            const match = relative.match(/(.*)\/demos\/(.*)\.([tj]sx|mdx?)$/)
            if (!match) throw new Error('unexpected file: ' + absolute)
            const [_, componentName, demoPath] = match
            const publicPath = `/${componentName}`

            // register the demo module as page daga
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

        // add static data(title) for each component page
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
      },
    }),
  ],
  alias: {
    'my-button': path.resolve(__dirname, '../button/src'),
    'my-card': path.resolve(__dirname, '../card/src'),
  },
  minify: false,
} as UserConfig
