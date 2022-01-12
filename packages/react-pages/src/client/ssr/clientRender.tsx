import React from 'react'
import ReactDOM from 'react-dom'
import type { PageLoaded } from '../../../clientTypes'
import App from '../App'
import SSRContextProvider from '../SSRContextProvider'
import pages from '/@react-pages/pages'

declare global {
  interface Window {
    _vitePagesSSR: {
      routePath: string
    }
  }
}

const routePath = window._vitePagesSSR?.routePath

if (!routePath) {
  console.error(
    `[vite-pages]: window._vitePagesSSR?.routePath should be defined`
  )
}

const pageDataImporter = pages[routePath]?.data
if (pageDataImporter) {
  // load current page data before hydrate
  pageDataImporter().then(({ default: pageLoaded }: any) => {
    const initCache: PageLoaded = {
      [routePath]: { ...pageLoaded },
    }
    hydrate(initCache)
  })
} else {
  // there is no page data for current page
  hydrate({})
}

function hydrate(initCache: PageLoaded) {
  ReactDOM.hydrate(
    <SSRContextProvider initCache={initCache}>
      <App />
    </SSRContextProvider>,
    document.getElementById('root')
  )
}
