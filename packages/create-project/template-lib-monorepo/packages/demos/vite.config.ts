import { defineConfig } from 'vite'
import * as path from 'path'
import react from '@vitejs/plugin-react'
import pages, { DefaultPageStrategy } from 'vite-plugin-react-pages'

export default defineConfig({
  plugins: [
    react(),
    pages({
      pagesDir: path.join(__dirname, 'pages'),
      pageStrategy: new DefaultPageStrategy({
        extraFindPages: async (pagesDir, helpers) => {
          const basePath = path.join(__dirname, '../')

          if (String(process.env.SHOW_ALL_COMPONENT_DEMOS) === 'true') {
            // show all component demos during dev
            // put them in page `/components/demos/${componentName}`
            helpers.watchFiles(
              basePath,
              '*/demos/**/*.{[tj]sx,md?(x)}',
              async function fileHandler(file, api) {
                const { relative, path: absolute } = file
                const match = relative.match(
                  /(.*)\/demos\/(.*)\.([tj]sx|mdx?)$/
                )
                if (!match) throw new Error('unexpected file: ' + absolute)
                const [_, componentName, demoName] = match
                const pageId = `/components/demos/${componentName}`
                // set page data
                const runtimeDataPaths = api.getRuntimeData(pageId)
                // the ?demo query will wrap the module with useful demoInfo
                runtimeDataPaths[demoName] = `${absolute}?demo`
              }
            )
          }

          // find all component README
          helpers.watchFiles(
            basePath,
            '*/README.md?(x)',
            async function fileHandler(file, api) {
              const { relative, path: absolute } = file
              const match = relative.match(/(.*)\/README\.mdx?$/)
              if (!match) throw new Error('unexpected file: ' + absolute)
              const [_, componentName] = match
              const pageId = `/components/${componentName}`
              // set page data
              const runtimeDataPaths = api.getRuntimeData(pageId)
              runtimeDataPaths.main = absolute
              // set page staticData
              const staticData = api.getStaticData(pageId)
              staticData.main = await helpers.extractStaticData(file)
            }
          )
        },
      }),
    }),
  ],
  resolve: {
    alias: {
      'my-button': path.resolve(__dirname, '../button/src'),
      'my-card': path.resolve(__dirname, '../card/src'),
    },
  },
  ssr: {
    // should not external them in ssr build,
    // otherwise the ssr bundle will contains `require("my-button")`
    // which will result in error
    noExternal: ['my-button', 'my-card'],
  },
  build: {
    minify: false,
  },
})
