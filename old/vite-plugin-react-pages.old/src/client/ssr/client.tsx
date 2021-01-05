import React, { useState } from 'react'
import { HashRouter, BrowserRouter } from 'react-router-dom'
import App from '../App'
import { dataCacheCtx, setDataCacheCtx } from './ctx'
import type { IPageLoaded } from '../types'

// @ts-ignore
const Router = __HASH_ROUTER__ ? HashRouter : BrowserRouter
// @ts-ignore
const basename = __HASH_ROUTER__
  ? undefined
  : import.meta.env.BASE_URL?.replace(/\/$/, '')

interface IProps {
  initCache?: IPageLoaded
}

const Client: React.FC<IProps> = ({ initCache }) => {
  const [dataCache, setDataCache] = useState<IPageLoaded>(initCache ?? {})
  return (
    // @ts-ignore
    <Router basename={basename}>
      <dataCacheCtx.Provider value={dataCache}>
        <setDataCacheCtx.Provider value={setDataCache}>
          <App />
        </setDataCacheCtx.Provider>
      </dataCacheCtx.Provider>
    </Router>
  )
}

export default Client
