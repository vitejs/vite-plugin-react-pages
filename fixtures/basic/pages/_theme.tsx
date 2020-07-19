import React from 'react'
import Layout from '/@layout/index'
import type { ISideMenuData } from '/@layout/side-menu'
import type { ITopNavData } from '/@layout/top-bar'
import type { ICreateTheme, IPages } from 'vite-plugin-react-pages'

const topNavs: ITopNavData[] = [
  { text: 'index', path: '/' },
  { text: 'React', href: 'https://reactjs.org/' },
  { text: 'Vite', href: 'https://github.com/vitejs/vite' },
]

const theme: ICreateTheme = (pages) => {
  const sideMenuData = defaultMenu(pages)
  return {
    loaded(pageData) {
      const Component = pageData.default
      console.log('#loaded', pageData, pages)
      return (
        <Layout
          sideMenuData={sideMenuData}
          topNavs={topNavs}
          logo="Vite Pages Basic Demo"
        >
          <Component />
        </Layout>
      )
    },
  }
}

export default theme

function defaultMenu(pages: IPages): ISideMenuData[] {
  return Object.entries<any>(pages)
    .filter(([path]) => path !== '/404')
    .sort((a, b) => {
      const [pathA, { staticData: staticDataA }] = a
      const [pathB, { staticData: staticDataB }] = b
      let ASort: number
      let BSort: number
      if (staticDataA.sort) ASort = Number(staticDataA.sort)
      else ASort = 1
      if (staticDataB.sort) BSort = Number(staticDataB.sort)
      else BSort = 1
      if (ASort !== BSort) return ASort - BSort
      return pathA.localeCompare(pathB)
    })
    .map(([path, { staticData }]) => {
      return {
        path,
        text: staticData.title,
      }
    })
}
