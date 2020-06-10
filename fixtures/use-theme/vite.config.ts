import type { UserConfig } from 'vite'
import * as vpr from 'vite-plugin-react'
import pages from 'vite-plugin-react-pages'

module.exports = {
  jsx: 'react',
  plugins: [vpr, pages()],
  optimizeDeps: {
    link: ['vite-pages-theme-basic'],
  },
} as UserConfig
