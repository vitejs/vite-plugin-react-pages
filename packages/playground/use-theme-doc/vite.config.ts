import { defineConfig } from 'vite'
import * as path from 'path'
import react from '@vitejs/plugin-react'
import mdx from 'vite-plugin-mdx'
import pages from 'vite-plugin-react-pages'

module.exports = defineConfig({
  plugins: [
    react(),
    mdx(),
    pages({
      pagesDir: path.join(__dirname, 'pages'),
      // i18n: {
      //   defaultLocale: 'en',
      //   locales: {
      //     en: {
      //       lang: 'en-US', // this will be set as the lang attribute on <html>
      //       routePrefix: '/'
      //     },
      //     zh: {
      //       lang: 'zh-CN',
      //       routePrefix: '/zh/'
      //     }
      //   }
      // },
    }),
  ],
  // theme local dev
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          'ant-prefix': 'vp-antd',
        },
        javascriptEnabled: true,
      },
    },
    modules: {
      generateScopedName: `vp-local-[local]`,
    },
  },
})
