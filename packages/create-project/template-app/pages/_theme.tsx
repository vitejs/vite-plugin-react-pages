import React from 'react'
import { createTheme, defaultSideNavs } from 'vite-pages-theme-doc'

export default createTheme({
  logo: <div style={{ marginLeft: 40, fontWeight: 'bold' }}>Vite Pages</div>,
  topNavs: [
    { label: 'Home', path: '/' },
    { label: 'Users', path: '/users' },
    {
      label: 'Guide',
      path: '/guide/introduce',
    },
    {
      label: 'Reference',
      path: '/reference/glossary',
    },
    { label: 'Vite', href: 'https://github.com/vitejs/vite' },
    {
      label: 'Vite Pages',
      href: 'https://github.com/vitejs/vite-plugin-react-pages',
    },
  ],
  sideNavs: (ctx) => {
    if (ctx.loadState.routePath.startsWith('/users')) {
      return null
    }
    return defaultSideNavs(ctx, {
      groupConfig: {
        '/reference': {
          concepts: {
            label: 'Concepts',
            order: 1,
          },
          'cli-commands': {
            label: 'CLI Commands',
            order: 2,
          },
          'error-codes': {
            label: 'Error Codes',
            order: 3,
          },
        },
      },
    })
  },
})
