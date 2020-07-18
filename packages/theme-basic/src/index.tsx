import React from 'react'
import type { ITheme, ICreateTheme, IPages } from 'vite-plugin-react-pages'
import Layout from './layout'
import type { ISideMenuData } from './layout/side-menu'
import type { ITopNavData } from './layout/top-bar'

interface IOption {
  sideMenuData?: ISideMenuData[]
  topNavs?: ITopNavData[]
  logo?: React.ReactNode
}

export function createTheme({
  topNavs,
  logo,
  sideMenuData,
}: IOption = {}): ICreateTheme {
  return (pages) => {
    const menu = sideMenuData ?? defaultMenu(pages)
    return {
      initialLoading(pageStaticData) {
        return (
          <Layout
            sideMenuData={menu}
            topNavs={topNavs ?? []}
            logo={logo}
            applyMdStyle={pageStaticData.sourceType === 'md'}
            path={pageStaticData._path}
          >
            <p>initial Loading...</p>
          </Layout>
        )
      },
      loaded(pageData) {
        if (pageData.isComposedPage) {
          const composeModules = pageData.default
          return (
            <Layout
              sideMenuData={menu}
              topNavs={topNavs ?? []}
              logo={logo}
              path={pageData._path}
            >
              {composeModules.map((module: any, idx: number) => {
                const part = pageData.parts[idx]
                const ContentComp = module.default
                return (
                  <section style={{ marginBottom: '40px' }} key={idx}>
                    <h2>{part.title}</h2>
                    <ContentComp />
                  </section>
                )
              })}
            </Layout>
          )
        }
        const ContentComp = pageData.default
        return (
          <Layout
            sideMenuData={menu}
            topNavs={topNavs ?? []}
            logo={logo}
            applyMdStyle={pageData.sourceType === 'md'}
            path={pageData._path}
          >
            <ContentComp />
          </Layout>
        )
      },
      transitionLoading(pageStaticData, prevPageData) {
        return (
          <Layout
            sideMenuData={menu}
            topNavs={topNavs ?? []}
            logo={logo}
            applyMdStyle={pageStaticData.sourceType === 'md'}
            path={pageStaticData._path}
          >
            <p>transition Loading...</p>
          </Layout>
        )
      },
      loadError(error, pageStaticData) {
        return (
          <Layout
            sideMenuData={menu}
            topNavs={topNavs ?? []}
            logo={logo}
            applyMdStyle={pageStaticData.sourceType === 'md'}
            path={pageStaticData._path}
          >
            <p>Load error</p>
          </Layout>
        )
      },
      noPageMatch(renderPage) {
        if (pages['/404']) {
          return renderPage('/404')
        }
        return (
          <Layout sideMenuData={menu} topNavs={topNavs ?? []} logo={logo}>
            <p>Page Not Found.</p>
          </Layout>
        )
      },
    }
  }
}

export { Layout }

export function defaultMenu(pages: IPages): ISideMenuData[] {
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
        text: staticData.title || path,
      }
    })
}
