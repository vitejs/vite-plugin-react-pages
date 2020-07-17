import React from 'react'
import { Layout } from 'vite-pages-theme-basic'
import type { ICreateTheme, IPages } from 'vite-plugin-react-pages'
import { ISideMenuData } from 'vite-pages-theme-basic/dist/layout/side-menu'

const theme: ICreateTheme = (pages) => {
  const logo = 'Vite Pages Demo'
  const topNavs: any[] = []
  const menu = getMenu(pages)
  return {
    initialLoading(pageStaticData) {
      return (
        <Layout
          sideMenuData={menu}
          topNavs={topNavs ?? []}
          logo={logo}
          path={pageStaticData._path}
        >
          <p>initial Loading...</p>
        </Layout>
      )
    },
    loaded(pageData) {
      console.log('loaded', pageData)
      if (pageData.isMergedPage) {
        const composeModule = pageData.default
        return (
          <Layout
            sideMenuData={menu}
            topNavs={topNavs ?? []}
            logo={logo}
            path={pageData._path}
          >
            {composeModule.map((module: any, idx: number) => {
              const file = pageData.files[idx]
              const ContentComp = module.default
              return (
                <section style={{ marginBottom: '40px' }} key={idx}>
                  <h2>{file.title}</h2>
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

export default theme

export function getMenu(pages: IPages): ISideMenuData[] {
  console.log(pages)
  return Object.entries<any>(pages)
    .filter(([path]) => path !== '/404')
    .map(([path, { staticData }]) => {
      return {
        path,
        text: `${staticData.componentName}'s demos`,
      }
    })
}
