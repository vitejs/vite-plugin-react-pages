import React from 'react'
import { createTheme } from 'vite-pages-theme-doc/src/index.dev'

export default createTheme({
  logo: <div style={{ marginLeft: 40, fontWeight: 'bold' }}>Vite Pages</div>,
  topNavs: [
    {
      label: 'Index',
      path: '/',
      activeIfMatch: {
        // match all first-level paths
        path: '/:foo',
        exact: true,
      },
    },
    {
      label: 'Components',
      path: '/components/Button',
      activeIfMatch: '/components',
    },
    { label: 'Vite', href: 'https://github.com/vitejs/vite' },
    {
      label: 'Vite Pages',
      href: 'https://github.com/vitejs/vite-plugin-react-pages',
    },
  ],
})
