/**
 * This is the entry for client-side-render(csr).
 * Used in: dev mode, build mode.
 * 
 * TODO: pre-bundle this entry to reduce requests during dev.
 * also avoid local jotai copy.
 */

import React from 'react'
import { createRoot } from 'react-dom/client'

import { Provider as Jotai } from 'jotai'
import ClientAppWrapper from './ClientAppWrapper'
import App from '../App'

let app = <App />
if (import.meta.hot) {
  // We only need Jotai to manage hmr state update during dev
  // @ts-ignore
  app = <Jotai>{app}</Jotai>
}

const container = document.getElementById('root')!
const root = createRoot(container)
root.render(<ClientAppWrapper>{app}</ClientAppWrapper>)
