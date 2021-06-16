import React from 'react'
import { createTheme, defaultSideNavs } from 'vite-pages-theme-doc'

export default createTheme({
  topNavs: [
    {
      label: 'Github',
      href: 'https://github.com/vitejs/vite-plugin-react-pages',
      icon: '⭐',
    },
  ],
  logo: <div style={{ marginLeft: 40, fontSize: '20px' }}>Vite Pages</div>,
  sideNavs(ctx) {
    return defaultSideNavs(ctx, {
      groupConfig: {
        '/': {
          advanced: {
            label: 'Advanced',
            order: 2,
          },
          'upgrade-guides': {
            label: 'Upgrade Guides',
            order: 3,
          },
        },
      },
    })
  },
})
