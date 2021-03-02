/// <reference types="vite/client" />

import React, { useState } from 'react'
import { HashRouter, BrowserRouter } from 'react-router-dom'
import { dataCacheCtx, setDataCacheCtx } from './ssr/ctx'
import type { PageLoaded } from '../../client'

// @ts-expect-error
const Router = __HASH_ROUTER__ ? HashRouter : BrowserRouter
// @ts-expect-error
const basename = __HASH_ROUTER__
  ? undefined
  : import.meta.env.BASE_URL?.replace(/\/$/, '')

interface Props {
  readonly initCache?: PageLoaded
}

const SSRContextProvider: React.FC<Props> = ({ initCache, children }) => {
  const [dataCache, setDataCache] = useState<PageLoaded>(initCache ?? {})
  return (
    // @ts-expect-error
    <Router basename={basename}>
      <dataCacheCtx.Provider value={dataCache}>
        <setDataCacheCtx.Provider value={setDataCache}>
          {children}
        </setDataCacheCtx.Provider>
      </dataCacheCtx.Provider>
    </Router>
  )
}

export default SSRContextProvider
