import 'vite/dynamic-import-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import App from '../App'
import SSRContextProvider from '../SSRContextProvider'
import pages from '@!virtual-modules/pages'

declare global {
  interface Window {
    _vitePagesSSR: {
      routePath: string
    }
  }
}

if (!window._vitePagesSSR?.routePath) {
  throw new Error(`window._vitePagesSSRPath should be defined`)
}

const routePath = window._vitePagesSSR.routePath
const pageDataImporter = pages[routePath].data
pageDataImporter().then(({ default: pageLoaded }: any) => {
  const initCache = {
    [routePath]: { ...pageLoaded },
  }
  ReactDOM.hydrate(
    <SSRContextProvider initCache={initCache}>
      <App />
    </SSRContextProvider>,
    document.getElementById('root')
  )
})
