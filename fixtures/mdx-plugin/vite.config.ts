import type { UserConfig } from 'vite'
import mdx from 'vite-plugin-mdx'
import reactRefresh from '@vitejs/plugin-react-refresh'

import remarkToc from 'remark-toc'
import remarkSlug from 'remark-slug'

module.exports = {
  jsx: 'react',
  plugins: [
    reactRefresh(),
    mdx({
      remarkPlugins: [remarkToc, remarkSlug],
    }),
  ],
} as UserConfig
