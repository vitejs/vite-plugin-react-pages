import type { MenuConfig } from '../themeDev'

export const topNavsConfig: { [locale: string]: MenuConfig[] } = {
  en: [
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
  zh: [
    { label: '首页', path: '/zh' },
    // { label: '用户', path: '/zh/users', activeIfMatch: '/users' },
    {
      label: '组件',
      path: '/zh/components/overview',
      activeIfMatch: '/zh/components',
    },
    // {
    //   label: '指南',
    //   path: '/zh/guide/introduce',
    //   activeIfMatch: '/zh/guide',
    // },
    // {
    //   label: '参考',
    //   path: '/zh/reference/glossary',
    //   activeIfMatch: '/zh/reference',
    // },
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
  ],
}
