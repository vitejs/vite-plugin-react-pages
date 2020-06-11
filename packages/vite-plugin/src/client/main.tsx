import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter basename={process.env.BASE_URL?.replace(/\/$/, '')}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
)
