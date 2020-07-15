import React, { useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import App from '../App'
import { dataCacheCtx, setDataCacheCtx } from './ctx'
import type { IDataCache } from './ctx'

interface IProps {
  initCache?: IDataCache
}

const Client: React.FC<IProps> = ({ initCache }) => {
  const [dataCache, setDataCache] = useState<IDataCache>(
    initCache ?? { pages: {} }
  )
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL?.replace(/\/$/, '')}>
      <dataCacheCtx.Provider value={dataCache}>
        <setDataCacheCtx.Provider value={setDataCache}>
          <App />
        </setDataCacheCtx.Provider>
      </dataCacheCtx.Provider>
    </BrowserRouter>
  )
}

export default Client
