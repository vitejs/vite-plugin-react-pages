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
          },
          {
            label: 'Help',
            url: 'https://github.com/vitejs/vite-plugin-react-pages/issues',
          },
        ],
      },
      {
        title: 'More',
        items: [
          {
            label: 'Vite',
            url: 'https://vitejs.dev/',
          },
          {
            label: 'GitHub',
            url: 'https://github.com/vitejs/vite-plugin-react-pages',
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
          },
          {
            label: '帮助',
            url: 'https://github.com/vitejs/vite-plugin-react-pages/issues',
          },
        ],
      },
      {
        title: '更多',
        items: [
          {
            label: 'Vite',
            url: 'https://vitejs.dev/',
          },
          {
            label: 'GitHub',
            url: 'https://github.com/vitejs/vite-plugin-react-pages',
          },
        ],
      },
    ],
  },
}
