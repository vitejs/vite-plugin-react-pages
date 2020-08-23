import React, { useMemo } from 'react'
import type { ITheme, IPagesStaticData } from 'vite-plugin-react-pages'
import Layout from './layout'
import type { ISideMenuData, ITopNavData } from './layout'
import MD from './layout/MDX'

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
}: IOption = {}): ITheme {
  const Theme: ITheme = ({ staticData, loadedData, loadState }) => {
    console.log('#Theme', staticData, loadedData, loadState)

    const menu = useMemo(() => {
      return sideMenuData ?? defaultMenu(staticData)
    }, [sideMenuData, staticData])

    if (loadState.type === 'loading') {
      return (
        <Layout
          sideMenuData={menu}
          topNavs={topNavs ?? []}
          logo={logo}
          path={loadState.routePath}
          footer={footer}
          topbarOperations={topbarOperations}
          pagesStaticData={staticData}
        >
          <p>initial Loading...</p>
        </Layout>
      )
    }
    if (loadState.type === 'load-error') {
      return (
        <Layout
          sideMenuData={menu}
          topNavs={topNavs ?? []}
          logo={logo}
          path={loadState.routePath}
          footer={footer}
          topbarOperations={topbarOperations}
          pagesStaticData={staticData}
        >
          <p>Load error</p>
        </Layout>
      )
    }

    const pageData = loadedData[loadState.routePath]
    const pageStaticData = staticData[loadState.routePath]
    const isComposedPage = Object.keys(pageData).length > 1
    return (
      <Layout
        sideMenuData={menu}
        topNavs={topNavs ?? []}
        logo={logo}
        path={loadState.routePath}
        footer={footer}
        topbarOperations={topbarOperations}
        pagesStaticData={staticData}
      >
        {Object.entries(pageData).map(([key, dataPart], idx) => {
          const ContentComp = (dataPart as any).default
          const pageStaticDataPart = pageStaticData[key]
          const isMD = pageStaticDataPart.sourceType === 'md'
          const content = isMD ? (
            <MD>
              <ContentComp />
            </MD>
          ) : (
            <ContentComp />
          )
          if (isComposedPage) {
            return (
              <section style={{ marginBottom: '40px' }} key={idx}>
                <h2>{pageStaticDataPart.title}</h2>
                {pageStaticDataPart.description && (
                  <p>{pageStaticDataPart.description}</p>
                )}
                {content}
              </section>
            )
          }
          return <div key={idx}>{content}</div>
        })}
      </Layout>
    )
  }

  return Theme
}

export { Layout }

export function defaultMenu(pages: IPagesStaticData): ISideMenuData[] {
  return Object.entries<any>(pages)
    .filter(([path]) => path !== '/404')
    .filter(([path, staticData]) => !staticData.hideInMenu)
    .sort((a, b) => {
      const [pathA, staticDataA] = a
      const [pathB, staticDataB] = b
      let ASort: number
      let BSort: number
      if (staticDataA.sort) ASort = Number(staticDataA.sort)
      else if (staticDataA.main?.sort) ASort = Number(staticDataA.main.sort)
      else ASort = 1
      if (staticDataB.sort) BSort = Number(staticDataB.sort)
      else if (staticDataB.main?.sort) BSort = Number(staticDataB.main.sort)
      else BSort = 1
      if (ASort !== BSort) return ASort - BSort
      return pathA.localeCompare(pathB)
    })
    .map(([path, staticData]) => {
      return {
        path,
        text: staticData.title ?? staticData.main?.title ?? path,
      }
    })
}
