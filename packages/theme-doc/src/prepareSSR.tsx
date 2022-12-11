import React from 'react'
// https://ant.design/docs/react/customize-theme#server-side-render-ssr
import { createCache, extractStyle, StyleProvider } from '@ant-design/cssinjs'

// todo: not useful currently
export function prepareSSR(app: React.ReactNode) {
  const cache = createCache()
  return {
    app: <StyleProvider cache={cache}>{app}</StyleProvider>,
    extractStyle: () => extractStyle(cache)
  }
}
