import React, { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'
import { dataCacheCtx, setDataCacheCtx } from './ctx'
import type { IDataCache } from './ctx'

const Client: React.FC = () => {
  const [dataCache, setDataCache] = useState<IDataCache>({ pages: {} })
  return (
    <React.StrictMode>
      <BrowserRouter basename={process.env.BASE_URL?.replace(/\/$/, '')}>
        <dataCacheCtx.Provider value={dataCache}>
          <setDataCacheCtx.Provider value={setDataCache}>
            <App />
          </setDataCacheCtx.Provider>
        </dataCacheCtx.Provider>
      </BrowserRouter>
    </React.StrictMode>
  )
}

export default Client

