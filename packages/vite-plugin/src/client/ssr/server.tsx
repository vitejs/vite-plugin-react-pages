import React from 'react'
import ReactDOM from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'

import { ssrData } from '/@generated/ssrData'
import App from '../App'
import { dataCacheCtx } from './ctx'

export function renderToString(url: string) {
  return ReactDOM.renderToString(
    <React.StrictMode>
      <StaticRouter
        basename={process.env.BASE_URL?.replace(/\/$/, '')}
        location={url}
      >
        <dataCacheCtx.Provider value={ssrData}>
          <App />
        </dataCacheCtx.Provider>
      </StaticRouter>
    </React.StrictMode>
  )
}

export { ssrData }
