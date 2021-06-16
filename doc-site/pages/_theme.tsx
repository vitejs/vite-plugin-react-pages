import React from 'react'
import { createTheme } from 'vite-pages-theme-doc'

export default createTheme({
  topNavs: [
    {
      label: 'Github',
      href: 'https://github.com/vitejs/vite-plugin-react-pages',
    },
  ],
  logo: <div style={{ marginLeft: 40, fontSize: '20px' }}>Vite Pages</div>,
})
