import React from 'react'
import type { ICreateTheme, IPages } from 'vite-plugin-react-pages'
import Layout from './layout'
import type { ISideMenuData, ITopNavData } from './layout'

// import '@alifd/next/dist/next-noreset.css'

interface IOption {
  sideMenuData?: ISideMenuData[]
  topNavs?: ITopNavData[]
  logo?: React.ReactNode
  footer?: React.ReactNode
  topbarOperations?: React.ReactNode
}

export function createTheme({
  topNavs,
  logo,
  sideMenuData,
  footer,
  topbarOperations,
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
            footer={footer}
            pages={pages}
            topbarOperations={topbarOperations}
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
              footer={footer}
              pages={pages}
              topbarOperations={topbarOperations}
            >
              {composeModules.map((module: any, idx: number) => {
                const part = pageData.parts[idx]
                const ContentComp = module.default
                return (
                  <section style={{ marginBottom: '40px' }} key={idx}>
                    <h2>{part.title}</h2>
                    {part.description && <p>{part.description}</p>}
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
            footer={footer}
            pages={pages}
            topbarOperations={topbarOperations}
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
            footer={footer}
            pages={pages}
            topbarOperations={topbarOperations}
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
            footer={footer}
            pages={pages}
            topbarOperations={topbarOperations}
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
          <Layout
            sideMenuData={menu}
            topNavs={topNavs ?? []}
            logo={logo}
            footer={footer}
            pages={pages}
            topbarOperations={topbarOperations}
          >
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
    .filter(([path, { staticData }]) => !staticData.hideInMenu)
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
