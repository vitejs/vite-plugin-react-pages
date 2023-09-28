import { defineConfig } from 'vite'
import * as path from 'path'
// import react from '@vitejs/plugin-react'
import react from '@vitejs/plugin-react-swc'

import pages from 'vite-plugin-react-pages'

export default defineConfig({
  resolve: {
    alias: {
      '~pages/': `${path.join(__dirname, 'pages')}/`,
    },
  },
  plugins: [
    react(),
    pages({
      pagesDir: path.join(__dirname, 'pages'),
      // useHashRouter: true
      modifyRemarkPlugins(original) {
        return [
          ...original,
          {
            name: 'remark-emoji',
            createPlugin: () => import('remark-emoji').then((m) => m.default),
          },
          {
            name: 'remark-math',
            createPlugin: () => import('remark-math').then((m) => m.default),
          },
        ]
      },
      modifyRehypePlugins(original) {
        return [
          ...original,
          {
            name: 'rehype-mathjax',
            createPlugin: () =>
              import('rehype-mathjax').then((m) => m.default as any),
          },
        ]
      },
    }),
  ],
  // theme local dev
  css: {
    modules: {
      generateScopedName: `vp-local-[local]`,
    },
  },
})
