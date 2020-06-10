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
      return a[0].localeCompare(b[0])
    })
    .map(([path, { staticData }]) => {
      return {
        path,
        text: path,
      }
    })
}
