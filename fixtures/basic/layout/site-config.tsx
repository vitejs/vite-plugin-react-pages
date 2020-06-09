import React from 'react'

import type { ITopNavData } from './top-bar'

// type-check site config
export const topNavs: ITopNavData[] = [
  { text: 'index', path: '/' },
  { text: 'React', href: 'https://reactjs.org/' },
  { text: 'Vite', href: 'https://github.com/vitejs/vite' },
]

export const logo: React.ReactElement = <span>Logo</span>
