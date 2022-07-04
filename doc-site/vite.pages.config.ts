import type { UserConfig } from 'vite'

import react from '@vitejs/plugin-react'
import mdx from 'vite-plugin-mdx'
import pages from 'vite-plugin-react-pages'

module.exports = {
  jsx: 'react',
  plugins: [react(), mdx(), pages()],
  base: '/vite-plugin-react-pages/'
} as UserConfig