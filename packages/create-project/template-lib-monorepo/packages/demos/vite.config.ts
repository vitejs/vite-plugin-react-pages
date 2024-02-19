import { defineConfig } from 'vite'
import * as path from 'path'
import react from '@vitejs/plugin-react' // you can also use @vitejs/plugin-react-swc
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
                const { relative, path: demoFilePath } = file
                const match = relative.match(
                  /(.*)\/demos\/(.*)\.([tj]sx|mdx?)$/
                )
                if (!match) throw new Error('unexpected file: ' + demoFilePath)
                const [_, componentName, demoName] = match
                const pageId = `/components/demos/${componentName}`
                // register page data
                api.addPageData({
                  pageId,
                  key: demoName,
                  // register demo runtime data path
                  // it will be consumed by theme-doc
                  // the ?demo query will wrap the module with useful demoInfo
                  dataPath: `${demoFilePath}?demo`,
                  // register demo static data
                  staticData: await helpers.extractStaticData(file),
                })
              }
            )
          }

          // find all component README
          helpers.watchFiles(
            basePath,
            '*/README.md?(x)',
            async function fileHandler(file, api) {
              const { relative, path: markdownFilePath } = file
              const match = relative.match(/(.*)\/README\.mdx?$/)
              if (!match)
                throw new Error('unexpected file: ' + markdownFilePath)
              const [_, componentName] = match
              const pageId = `/components/${componentName}`
              // register page data
              api.addPageData({
                pageId,
                // register page component
                dataPath: markdownFilePath,
                // register static data
                staticData: await helpers.extractStaticData(file),
              })
              // register outlineInfo data
              // it will be consumed by theme-doc
              api.addPageData({
                pageId,
                key: 'outlineInfo',
                // the ?outlineInfo query will extract title info from the markdown file and return the data as a js module
                dataPath: `${markdownFilePath}?outlineInfo`,
              })
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
