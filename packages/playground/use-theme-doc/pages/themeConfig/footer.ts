import type { FooterConfig } from '../themeDev'

export const footerConfig: { [locale: string]: FooterConfig } = {
  en: {
    message: `2020 - ${new Date().getFullYear()}`,
    copyright: 'Released under the MIT License.',
    columns: [
      {
        title: 'Community',
        items: [
          {
            label: 'Stack Overflow',
            url: 'https://stackoverflow.com/questions/tagged/vite-plugin-react-pages',
            openExternal: true,
          },
          {
            label: 'Help',
            url: 'https://github.com/vitejs/vite-plugin-react-pages/issues',
            openExternal: true,
          },
        ],
      },
      {
        title: 'More',
        items: [
          {
            label: 'Vite',
            url: 'https://vitejs.dev/',
            openExternal: true,
          },
          {
            label: 'GitHub',
            url: 'https://github.com/vitejs/vite-plugin-react-pages',
            openExternal: true,
          },
        ],
      },
    ],
  },
  zh: {
    message: `2020 - ${new Date().getFullYear()}`,
    copyright: '以 MIT 许可证发布',
    columns: [
      {
        title: '社区',
        items: [
          {
            label: 'Stack Overflow',
            url: 'https://stackoverflow.com/questions/tagged/vite-plugin-react-pages',
            openExternal: true,
          },
          {
            label: '帮助',
            url: 'https://github.com/vitejs/vite-plugin-react-pages/issues',
            openExternal: true,
          },
        ],
      },
      {
        title: '更多',
        items: [
          {
            label: 'Vite',
            url: 'https://vitejs.dev/',
            openExternal: true,
          },
          {
            label: 'GitHub',
            url: 'https://github.com/vitejs/vite-plugin-react-pages',
            openExternal: true,
          },
        ],
      },
    ],
  },
}
