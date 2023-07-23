import { defineConfig } from 'vite'
import * as path from 'path'
// import react from '@vitejs/plugin-react'
import react from "@vitejs/plugin-react-swc";

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
    }),
  ],
  // theme local dev
  css: {
    modules: {
      generateScopedName: `vp-local-[local]`,
    },
  },
})
