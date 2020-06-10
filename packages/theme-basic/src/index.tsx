import React from 'react'
import type { IRenderPage, IPages } from 'vite-plugin-react-pages/client'
import Layout from './layout'
import type { ISideMenuData } from './layout/side-menu'
import type { ITopNavData } from './layout/top-bar'

interface IOption {
  sideMenuData?: ISideMenuData[]
  topNavs?: ITopNavData[]
  logo?: React.ReactNode
}

export const createRender = ({
  topNavs,
  logo,
  sideMenuData,
}: IOption = {}): IRenderPage => {
  return (pageData, pages) => {
    return (
      <Layout
        Content={pageData.default}
        sideMenuData={sideMenuData ?? defaultMenu(pages)}
        topNavs={topNavs ?? []}
        logo={logo}
        applyMdStyle={pageData.sourceType === 'md'}
      />
    )
  }
}

function defaultMenu(pages: IPages): ISideMenuData[] {
  return Object.entries<any>(pages)
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
        text: path,
      }
    })
}
