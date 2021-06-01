import React from 'react'
import { createTheme } from 'vite-pages-new-theme-basic/src/index.dev'
import { Button } from 'antd'

export default createTheme({
  logo: <div style={{ marginLeft: 40, fontWeight: 'bold' }}>Vite Pages</div>,
  topNavs: [
    {
      label: 'Design',
      path: '/docs/spec/introduce',
    },
    {
      label: 'Develop',
      path: '/docs/react/introduce',
    },
    {
      label: 'Components',
      path: '/components/overview',
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
          path: '/docs/resources',
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
  sideNavs: ({ loadState }) => {
    if (loadState.routePath.startsWith('/docs/spec')) {
      return [
        {
          subMenu: 'Ant Design',
          children: [
            {
              label: 'Introduction',
              path: '/docs/spec/introduce',
            },
            {
              label: 'Design Values',
              path: '/docs/spec/values',
            },
          ],
        },
        {
          subMenu: 'Design Patterns',
          children: [
            { label: 'Overview', path: '/docs/spec/overview' },
            {
              group: 'Principles',
              children: [
                {
                  label: 'Proximity',
                  path: '/docs/spec/proximity',
                },
                {
                  label: 'Alignment',
                  path: '/docs/spec/alignment',
                },
              ],
            },
          ],
        },
      ]
    }
    if (loadState.routePath.startsWith('/components/')) {
      return [
        { label: 'Components Overview', path: '/components/overview' },

        {
          group: 'General',
          children: [
            {
              label: 'Button',
              path: '/components/button',
            },
            {
              label: 'Icon',
              path: '/components/icon',
            },
          ],
        },

        {
          group: 'Layout',
          children: [
            {
              label: 'Divider',
              path: '/components/divider',
            },
            {
              label: 'Grid',
              path: '/components/grid',
            },
          ],
        },
        {
          group: 'Data Display',
          children: [
            {
              label: 'Card',
              path: '/components/card',
            },
          ],
        },
        {
          group: 'Other',
          children: Array.from(Array(20)).map((_, index) => {
            return {
              label: 'Mock Item ' + index,
              path: '/components/mock/' + index,
            }
          }),
        },
      ]
    }
    if (loadState.routePath.startsWith('/docs/react')) {
      return [
        { label: 'Ant Design of React', path: '/docs/react/introduce' },
        { label: 'Getting Started', path: '/docs/react/getting-started' },
        ...Array.from(Array(20)).map((_, index) => {
          return {
            label: 'Mock Item ' + index,
            path: '/docs/react/mock/' + index,
          }
        }),
      ]
    }
    // don't render sidebar
    return null
  },
})
