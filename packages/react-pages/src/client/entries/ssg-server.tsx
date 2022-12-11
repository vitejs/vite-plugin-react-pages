/**
 * This is the entry for static-site-generation(ssg)'s server side render.
 * Used in: "ssr mode"
 * ("ssr" is used in many places in this project to refer to "ssg". Should have called it ssg mode...)
 */

import React from 'react'
import ReactDOM from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'

import ssrData from '/@react-pages/ssrData'
import App from '../App'
import { dataCacheCtx } from '../ctx'
import type { PagesLoaded } from '../../../clientTypes'

// put all page data in cache, so that we don't need to load it in ssr
const dataCache: PagesLoaded = ssrData

export function renderToString(url: string) {
  let ssrApp = (
    <StaticRouter
      basename={import.meta.env.BASE_URL?.replace(/\/$/, '')}
      location={url}
    >
      <dataCacheCtx.Provider value={dataCache}>
        <App />
      </dataCacheCtx.Provider>
    </StaticRouter>
  )
  const contentText = ReactDOM.renderToString(ssrApp)
  const styleText = ''
  return { contentText, styleText }
}

export { ssrData }
