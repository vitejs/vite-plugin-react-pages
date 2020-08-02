import React, { useMemo } from 'react'
import Layout from '/@layout/index'
import type { ISideMenuData } from '/@layout/side-menu'
import type { ITopNavData } from '/@layout/top-bar'
import type { ITheme, IPagesStaticData } from 'vite-plugin-react-pages'

const topNavs: ITopNavData[] = [
  { text: 'index', path: '/' },
  { text: 'Vite', href: 'https://github.com/vitejs/vite' },
  {
    text: 'Vite Pages',
    href: 'https://github.com/vitejs/vite-plugin-react-pages',
  },
]

const Theme: ITheme = ({ staticData, loadedData, loadState }) => {
  console.log('#Theme', staticData, loadedData, loadState)
  const sideMenuData = useMemo(() => defaultMenu(staticData), [staticData])
  if (loadState.type !== 'loaded')
    return (
      <Layout
        sideMenuData={sideMenuData}
        topNavs={topNavs}
        logo="Vite Pages Basic Demo"
      >
        <p>{loadState.type}</p>
      </Layout>
    )

  const pageData = loadedData[loadState.routePath]
  const Component = pageData.main.default
  return (
    <Layout
      sideMenuData={sideMenuData}
      topNavs={topNavs}
      logo="Vite Pages Basic Demo"
    >
      <Component />
    </Layout>
  )
}

export default Theme

function defaultMenu(pages: IPagesStaticData): ISideMenuData[] {
  return Object.entries<any>(pages)
    .filter(([path]) => path !== '/404')
    .sort((a, b) => {
      const [pathA, { main: staticDataA }] = a
      const [pathB, { main: staticDataB }] = b
      let ASort: number
      let BSort: number
      if (staticDataA.sort) ASort = Number(staticDataA.sort)
      else ASort = 1
      if (staticDataB.sort) BSort = Number(staticDataB.sort)
      else BSort = 1
      if (ASort !== BSort) return ASort - BSort
      return pathA.localeCompare(pathB)
    })
    .map(([path, { main: staticData }]) => {
      return {
        path,
        text: staticData.title,
      }
    })
}
