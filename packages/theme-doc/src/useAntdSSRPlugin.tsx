import React from 'react'
import { useSSRPlugin } from 'vite-plugin-react-pages/client'
// https://ant.design/docs/react/customize-theme#server-side-render-ssr
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs'
import { isSSR } from './utils'

export function useAntdSSRPlugin() {
  if (isSSR) {
    useSSRPlugin({
      id: 'vite-pages-theme-doc-antd-ssr',
      prepare(app) {
        const cache = createCache()
        return {
          app: <StyleProvider cache={cache}>{app}</StyleProvider>,
          extractStyle: () => extractStyle(cache),
        }
      },
    })
  }
}
