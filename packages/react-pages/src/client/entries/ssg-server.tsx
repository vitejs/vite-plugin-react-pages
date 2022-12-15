/**
 * This is the entry for static-site-generation(ssg)'s server side render.
 * Used in: "ssr mode"
 * ("ssr" is used in many places in this project to refer to "ssg". Should have called it ssg mode...)
 */

import React from 'react'
import ReactDOM from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'

import App from '../App'
import { dataCacheCtx } from '../ctx'
import type { PagesLoaded } from '../../../clientTypes'
import type { SSRPlugin } from '../SSRPlugin'
import { collectSSRPlugins as collect } from '../SSRPlugin'

import ssrData from '/@react-pages/ssrData'
import { plugins as _plugins } from '/@react-pages/ssr-plugins'

const ssrPlugins: SSRPlugin[] = _plugins

console.log('[vite-pages] ssrPlugins:', ssrPlugins)

export { ssrData }

// put all page data in cache, so that we don't need to load it in ssr
const dataCache: PagesLoaded = ssrData

export function renderToString(url: string) {
  let ssrApp: React.ReactNode = <SSRApp url={url} />

  const extractStyleArr: (() => string)[] = []
  ssrPlugins.forEach((ssrPlugin) => {
    const { app, extractStyle } = ssrPlugin.prepare(ssrApp)
    if (extractStyle) extractStyleArr.push(extractStyle)
    if (app) ssrApp = app
  })

  const contentText = ReactDOM.renderToString(ssrApp)

  const styles = extractStyleArr
    .map((extractStyle) => {
      return extractStyle()
    })
    .filter(Boolean)
  const styleText = styles.join('\n')

  return {
    contentText,
    styleText,
  }
}

export function collectSSRPlugins(url: string): SSRPlugin[] {
  return collect(<SSRApp url={url} />)
}

function SSRApp({ url }: { url: string }) {
  return (
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
