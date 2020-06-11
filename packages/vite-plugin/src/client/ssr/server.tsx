import React from 'react'
import ReactDOM from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'

import { ssrData } from '/@generated/ssrData'
import App from '../App'
import { ssrDataCtx } from './ctx'

export function renderToString(url: string) {
  return ReactDOM.renderToString(
    <React.StrictMode>
      <StaticRouter location={url}>
        <ssrDataCtx.Provider value={ssrData}>
          <App />
        </ssrDataCtx.Provider>
      </StaticRouter>
    </React.StrictMode>
  )
}

export { ssrData }
