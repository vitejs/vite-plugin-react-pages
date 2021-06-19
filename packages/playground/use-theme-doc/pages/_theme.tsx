import React from 'react'
import {
  createTheme,
  defaultSideNavs,
} from 'vite-pages-theme-doc/src/index.dev'
// from 'vite-pages-theme-doc'
import { Button } from 'antd'

export default createTheme({
  logo: <div style={{ marginLeft: 40, fontWeight: 'bold' }}>Vite Pages</div>,
  topNavs: [
    { label: 'Home', path: '/' },
    { label: 'Users', path: '/users', activeIfMatch: '/users' },
    {
      label: 'Components',
      path: '/components/overview',
      activeIfMatch: '/components',
    },
    {
      label: 'Guide',
      path: '/guide/introduce',
      activeIfMatch: '/guide',
    },
    {
      label: 'Reference',
      path: '/reference/glossary',
      activeIfMatch: '/reference',
    },
    {
      label: 'Github',
      href: 'https://github.com/vitejs/vite-plugin-react-pages',
    },
    {
      subMenu: 'Links',
      children: [
        {
          label: 'Resources',
          path: '/resources',
        },
        {
          label: 'Vite',
          href: 'https://vitejs.dev/',
        },
        {
          label: 'Ant Design',
          href: 'https://ant.design/',
        },
      ],
    },
  ],
  TopBarExtra: () => {
    return (
      <Button size="small" style={{ verticalAlign: 'middle' }}>
        Extra
      </Button>
    )
  },
  sideNavs(ctx) {
    if (ctx.loadState.routePath.startsWith('/users')) {
      return null
    }
    return defaultSideNavs(ctx, {
      groupConfig: {
        reference: {
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
