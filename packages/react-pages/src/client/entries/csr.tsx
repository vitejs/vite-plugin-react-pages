/**
 * This is the entry for client-side-render(csr).
 * Used in: dev mode, build mode.
 */

import React from 'react'
import { createRoot } from 'react-dom/client'

import ClientAppWrapper from './ClientAppWrapper'
import App from '../App'

const container = document.getElementById('root')!
const root = createRoot(container)
root.render(
  <ClientAppWrapper>
    <App />
  </ClientAppWrapper>
)
