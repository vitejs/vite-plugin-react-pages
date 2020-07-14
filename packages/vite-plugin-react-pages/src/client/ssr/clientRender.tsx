import React from 'react'
import ReactDOM from 'react-dom'
import Client from './Client'

declare global {
  interface Window {
    _vitePagesSSR: {
      pagePublicPath: string
      pageData: string
    }
  }
}

if (!window._vitePagesSSR) {
  throw new Error(`window._vitePagesSSRPath should be defined`)
}

import(window._vitePagesSSR.pageData).then((pageData) => {
  const initCache = {
    pages: {
      [window._vitePagesSSR.pagePublicPath]: { ...pageData },
    },
  }
  ReactDOM.hydrate(
    <Client initCache={initCache} />,
    document.getElementById('root')
  )
})
