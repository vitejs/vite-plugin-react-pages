import type { UserConfig } from 'vite'
import * as vpr from 'vite-plugin-react'
import pages, {
  defaultFindPageFiles,
  findPagesFromGlob,
} from 'vite-plugin-react-pages'
import mdx from 'vite-plugin-mdx'
import * as path from 'path'

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
            publicPath: `/${componentName}/${demoPath}`,
            staticData: {
              componentName,
              demoPath,
            },
          }
        }
      )
      const defaultPages = await defaultFindPageFiles(pagesDir)
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
