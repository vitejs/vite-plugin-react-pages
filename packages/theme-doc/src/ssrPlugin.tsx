import React from 'react'
import { SSRPlugin } from 'vite-plugin-react-pages/clientTypes'
// https://ant.design/docs/react/customize-theme#server-side-render-ssr
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs'

export default {
  id: 'vite-pages-theme-doc-antd-ssr',
  prepare(app) {
    const cache = createCache()
    return {
      app: <StyleProvider cache={cache}>{app}</StyleProvider>,
      extractStyle: () => extractStyle(cache),
    }
  },
} as SSRPlugin
