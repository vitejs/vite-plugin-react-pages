import React from 'react'
import ReactDOM from 'react-dom'
import Client from './client'
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
    <Client initCache={initCache} />,
    document.getElementById('root')
  )
})
