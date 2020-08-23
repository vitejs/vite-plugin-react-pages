import React, { useMemo } from 'react'
import type { ITheme, IPagesStaticData } from 'vite-plugin-react-pages'
import Layout from './layout'
import type { ISideMenuData, ITopNavData } from './layout'
import MD from './layout/MDX'

interface IOption {
  /**
   * Take fully control of side nav menu.
   */
  sideMenuData?: ISideMenuData[]
  /**
   * Navigation menu at top bar.
   */
  topNavs?: ITopNavData[]
  /**
   * Logo area at top bar.
   */
  logo?: React.ReactNode
  /**
   * Operation area at top bar.
   */
  topbarOperations?: React.ReactNode
  /**
   * Footer area.
   */
  footer?: React.ReactNode
  /**
   * Enable search.
   * @default true
   */
  search?: boolean
}

export function createTheme({
  topNavs,
  logo,
  sideMenuData,
  footer,
  topbarOperations,
  search = true,
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
          search={search}
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
          search={search}
        >
          <p>Load error</p>
        </Layout>
      )
    }

    if (loadState.type === '404') {
      const Comp404 = loadedData['/404']?.main?.default
      return (
        <Layout
          sideMenuData={menu}
          topNavs={topNavs ?? []}
          logo={logo}
          path={loadState.routePath}
          footer={footer}
          topbarOperations={topbarOperations}
          pagesStaticData={staticData}
          search={search}
        >
          {Comp404 ? <Comp404 /> : <p>Page not found.</p>}
        </Layout>
      )
    }

    if (loadState.type !== 'loaded') {
      return <p>Unknown load loadState: {loadState.type}</p>
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
        search={search}
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
      if (staticDataA.sort !== undefined) ASort = Number(staticDataA.sort)
      else if (staticDataA.main?.sort !== undefined)
        ASort = Number(staticDataA.main.sort)
      else ASort = 1
      if (staticDataB.sort !== undefined) BSort = Number(staticDataB.sort)
      else if (staticDataB.main?.sort !== undefined)
        BSort = Number(staticDataB.main.sort)
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
