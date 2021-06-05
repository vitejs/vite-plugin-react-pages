import React from 'react'
import {
  createTheme,
  defaultSideNavs,
} from 'vite-pages-new-theme-basic/src/index.dev'
import { Button } from 'antd'

export default createTheme({
  logo: <div style={{ marginLeft: 40, fontWeight: 'bold' }}>Vite Pages</div>,
  topNavs: [
    {
      label: 'Components',
      path: '/components/overview',
    },
    {
      label: 'Guide',
      path: '/guide/introduce',
    },
    {
      label: 'Reference',
      path: '/reference/glossary',
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
    return defaultSideNavs(ctx, {
      groupConfig: {
        '/guide': {
          react: {
            label: 'React',
          },
          spec: {
            label: 'Specification',
            order: 0,
          },
        },
      },
    })
  },
})
