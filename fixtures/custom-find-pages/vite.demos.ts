import type { UserConfig } from 'vite'
import * as vpr from 'vite-plugin-react'
import pages, { defaultFindPageFiles } from 'vite-plugin-react-pages'
import type { IPageFile } from 'vite-plugin-react-pages'
import mdx from 'vite-plugin-mdx'
import * as path from 'path'
import globby from 'globby'

const pagesDir = path.join(__dirname, 'demos')

module.exports = {
  jsx: 'react',
  plugins: [
    vpr,
    mdx(),
    pages(pagesDir, async () => {
      const cwd = path.join(__dirname, 'src')
      const files = await globby('*/demos/**/*.[tj]s?(x)', {
        cwd,
      })
      const pages = files.map<IPageFile>((file) => {
        const match = file.match(/(.*)\/demos\/(.*)\.[tj]sx?$/)
        if (!match) throw new Error('unexpected file: ' + file)
        const [_, componentName, demoPath] = match
        const filePath = path.join(cwd, file)
        return {
          publicPath: `/${componentName}/${demoPath}`,
          filePath,
        }
      })
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
