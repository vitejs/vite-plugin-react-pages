import { defineConfig } from 'vite'
import * as path from 'path'
import react from '@vitejs/plugin-react'
import { setupPlugins } from 'vite-plugin-react-pages'
import { LessPluginRemoveAntdGlobalStyles } from 'less-plugin-remove-antd-global-styles'

export default defineConfig(async () => {
  return {
    resolve: {
      alias: {
        '~pages/': `${path.join(__dirname, 'pages')}/`,
      },
    },
    plugins: [
      react(),
      ...(await setupPlugins({
        pagesDir: path.join(__dirname, 'pages'),
        useHashRouter: true
      })),
    ],
    // theme local dev
    css: {
      preprocessorOptions: {
        less: {
          modifyVars: {
            'ant-prefix': 'vp-antd',
          },
          javascriptEnabled: true,
          plugins: [new LessPluginRemoveAntdGlobalStyles()],
        },
      },
      modules: {
        generateScopedName: `vp-local-[local]`,
      },
    },
  }
})
