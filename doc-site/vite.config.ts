import type { UserConfig } from 'vite'

import reactRefresh from '@vitejs/plugin-react-refresh'
import mdx from 'vite-plugin-mdx'
import pages from 'vite-plugin-react-pages'

module.exports = {
  jsx: 'react',
  plugins: [
    reactRefresh(),
    mdx(),
    pages({
      useHashRouter: true,
    }),
  ],
  base:
    process.env.GITHUB_PAGES_DEPLOY === 'true'
      ? '/vite-plugin-react-pages'
      : '/',
} as UserConfig
