import React from 'react'
import type { FooterConfig } from '../themeDev'
import {
  QuestionCircleOutlined,
  BugOutlined,
  GithubFilled,
  TeamOutlined,
  LinkOutlined,
} from '@ant-design/icons'

export const footerConfig: { [locale: string]: FooterConfig } = {
  en: {
    message: `2020 - ${new Date().getFullYear()}`,
    copyright: 'Released under the MIT License.',
    columns: [
      {
        icon: <TeamOutlined />,
        title: 'Community',
        items: [
          {
            icon: <QuestionCircleOutlined />,
            label: 'Stack Overflow',
            url: 'https://stackoverflow.com/questions/tagged/vite-plugin-react-pages',
          },
          {
            icon: <BugOutlined />,
            label: 'Help',
            url: 'https://github.com/vitejs/vite-plugin-react-pages/issues',
          },
        ],
      },
      {
        icon: <LinkOutlined />,
        title: 'Resources',
        items: [
          {
            icon: <img src="https://vitejs.dev/logo.svg" alt="vite" />,
            label: 'Vite',
            url: 'https://vitejs.dev/',
          },
          {
            icon: <GithubFilled />,
            label: 'GitHub',
            url: 'https://github.com/vitejs/vite-plugin-react-pages',
          },
        ],
      },
    ],
  },
  zh: {
    // test dark theme
    theme: 'dark',
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
