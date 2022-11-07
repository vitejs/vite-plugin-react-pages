import React from 'react'
import { createRoot } from 'react-dom/client'

import { Provider as Jotai } from './jotai'
import SSRContextProvider from './SSRContextProvider'
import App from './App'

let app = <App />
if (import.meta.hot) {
  // @ts-ignore
  app = <Jotai>{app}</Jotai>
}

const container = document.getElementById('root')!
const root = createRoot(container)
root.render(<SSRContextProvider>{app}</SSRContextProvider>)
