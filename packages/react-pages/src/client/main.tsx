import React from 'react'
import ReactDOM from 'react-dom'
import { Provider as Jotai } from './jotai'
import SSRContextProvider from './SSRContextProvider'
import App from './App'

let app = <App />
if (import.meta.hot) {
  app = <Jotai>{app}</Jotai>
}

ReactDOM.render(
  <SSRContextProvider>{app}</SSRContextProvider>,
  document.getElementById('root')
)
