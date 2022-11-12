/// <reference types="vite/client" />

import React, { useState } from 'react'
import { HashRouter, BrowserRouter } from 'react-router-dom'
import { dataCacheCtx, setDataCacheCtx } from './ssr/ctx'
import type { PageLoaded } from '../../clientTypes'

// @ts-expect-error
const Router = __HASH_ROUTER__ ? HashRouter : BrowserRouter
// @ts-expect-error
const basename = __HASH_ROUTER__
  ? undefined
  : import.meta.env.BASE_URL?.replace(/\/$/, '')

interface Props {
  readonly initCache?: PageLoaded
  readonly children: React.ReactNode
}

const SSRContextProvider: React.FC<React.PropsWithChildren<Props>> = ({ initCache, children }) => {
  const [dataCache, setDataCache] = useState<PageLoaded>(initCache ?? {})
  return (
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
