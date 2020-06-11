import type { UserConfig } from 'vite'
import * as vpr from 'vite-plugin-react'
import pages from 'vite-plugin-react-pages'
import mdx from 'vite-plugin-mdx'

module.exports = {
  jsx: 'react',
  plugins: [vpr, mdx, pages()],
  optimizeDeps: {
    exclude: ['vite-pages-theme-basic'],
  },
  minify: false,
} as UserConfig
