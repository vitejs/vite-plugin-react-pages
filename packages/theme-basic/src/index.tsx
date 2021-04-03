import React, { useMemo } from 'react'
import type { Theme, PagesStaticData } from 'vite-plugin-react-pages'
import { useStaticData } from 'vite-plugin-react-pages/client'
import Layout from './layout'
import type { SideMenuData, TopNavData } from './layout'
import MD from './layout/MDX'

interface Option {
  /**
   * Take fully control of side nav menu.
   */
  readonly sideMenuData?: ReadonlyArray<SideMenuData>
  /**
   * Navigation menu at top bar.
   */
  readonly topNavs?: ReadonlyArray<TopNavData>
  /**
   * Logo area at top bar.
   */
  readonly logo?: React.ReactNode
  /**
   * Operation area at top bar.
   */
  readonly topbarOperations?: React.ReactNode
  /**
   * Footer area.
   */
  readonly footer?: React.ReactNode
  /**
   * Enable search.
   * @default true
   */
  readonly search?: boolean
}

export function createTheme({
  topNavs,
  logo,
  sideMenuData,
  footer,
  topbarOperations,
  search = true,
}: Option = {}): Theme {
  const Theme: Theme = ({ loadedData, loadState }) => {
    const staticData = useStaticData()
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
    let body
    if (isComposedPage) {
      body = Object.entries(pageData)
        .sort(([key1], [key2]) => {
          // README should be the first section
          if (key1 === 'README') return -1
          if (key2 === 'README') return 1
          return key1.localeCompare(key2)
        })
        .map(([key, dataPart], idx) => {
          const isREADME = key === 'README'
          const ContentComp = (dataPart as any).default
          const pageStaticDataPart = pageStaticData[key]
          const MdWrap =
            pageStaticDataPart.sourceType === 'md' ? MD : React.Fragment
          const content = (
            <MdWrap>
              <ContentComp />
            </MdWrap>
          )
          return (
            <section style={{ marginBottom: '40px' }} key={idx}>
              {!isREADME && <h2>{pageStaticDataPart.title}</h2>}
              {pageStaticDataPart.description && (
                <p>{pageStaticDataPart.description}</p>
              )}
              {content}
            </section>
          )
        })
    } else {
      body = Object.entries(pageData).map(([key, dataPart], idx) => {
        const ContentComp = (dataPart as any).default
        const pageStaticDataPart = pageStaticData[key]
        const MdWrap =
          pageStaticDataPart.sourceType === 'md' ? MD : React.Fragment
        const content = (
          <MdWrap>
            <ContentComp />
          </MdWrap>
        )
        return <div key={idx}>{content}</div>
      })
    }
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
        {body}
      </Layout>
    )
  }

  return Theme
}

export { Layout }

export function defaultMenu(pages: PagesStaticData): SideMenuData[] {
  return (
    Object.entries(pages)
      // These special pages should not be showed in side menu
      .filter(
        ([path, staticData]) =>
          path !== '/404' && !path.match(/\/:[^/]+/) && !staticData.hideInMenu
      )
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
  )
}
