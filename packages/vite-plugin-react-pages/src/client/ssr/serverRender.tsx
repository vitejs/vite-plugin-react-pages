/// <reference types="vite/dist/importMeta" />

import React from 'react'
import ReactDOM from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'

import { ssrData } from '/@generated/ssrData'
import App from '../App'
import { dataCacheCtx } from './ctx'
import type { IDataCache } from './ctx'

// put all page data in cache, so that we don't need to load it in ssr
const dataCache: IDataCache = { pages: ssrData }

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
