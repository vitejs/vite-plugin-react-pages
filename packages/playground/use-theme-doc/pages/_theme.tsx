import React from 'react'
import {
  createTheme,
  defaultSideNavs,
} from 'vite-pages-theme-doc/src/index.dev'
// from 'vite-pages-theme-doc'
import { Button } from 'antd'
import Component404 from './404'

export default createTheme({
  i18n: {
    defaultLocale: 'en',
    topBarLocaleSelector: true,
    locales: {
      en: {
        label: 'English',
        lang: 'en', // this will be set as the `lang` attribute on <html>
        routePrefix: '/',
      },
      zh: {
        label: '中文',
        lang: 'zh-CN',
        routePrefix: '/zh',
      },
    },
  },
  logo: <div style={{ fontSize: '20px' }}>📘 Vite Pages</div>,
  topNavs: ({ resolvedLocale: { localeKey } }) => {
    if (localeKey === 'zh')
      return [
        { label: '首页', path: '/zh' },
        { label: '用户', path: '/zh/users', activeIfMatch: '/users' },
        {
          label: '组件',
          path: '/zh/components/overview',
          activeIfMatch: '/zh/components',
        },
        {
          label: '指南',
          path: '/zh/guide/introduce',
          activeIfMatch: '/zh/guide',
        },
        {
          label: '参考',
          path: '/zh/reference/glossary',
          activeIfMatch: '/zh/reference',
        },
        {
          label: 'Github',
          href: 'https://github.com/vitejs/vite-plugin-react-pages',
        },
        {
          subMenu: '链接',
          children: [
            {
              label: '资源',
              path: '/zh/resources',
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
      ]

    return [
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
    ]
  },
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
        components: {
          general: {
            order: 0,
          },
        },
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
  Component404,
})
