import React from 'react'
import ReactDOM from 'react-dom'
import SSRContextProvider from './SSRContextProvider'
import App from './App'

ReactDOM.render(
  <SSRContextProvider>
    <App />
  </SSRContextProvider>,
  document.getElementById('root')
)
