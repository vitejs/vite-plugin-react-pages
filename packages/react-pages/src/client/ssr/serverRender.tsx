import React from 'react'
import ReactDOM from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'

import ssrData from '/@react-pages/ssrData'
import App from '../App'
import { dataCacheCtx } from './ctx'
import type { PagesLoaded } from '../../../clientTypes'

// put all page data in cache, so that we don't need to load it in ssr
const dataCache: PagesLoaded = ssrData

export function renderToString(url: string) {
  return ReactDOM.renderToString(
    <StaticRouter
      basename={import.meta.env.BASE_URL?.replace(/\/$/, '')}
      location={url}
    >
      <dataCacheCtx.Provider value={dataCache}>
        <App />
      </dataCacheCtx.Provider>
    </StaticRouter>
  )
}

export { ssrData }

export * from './ssrUtils'
