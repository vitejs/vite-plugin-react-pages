import React, { useMemo } from 'react'
import type { ThemeProps } from 'vite-plugin-react-pages/clientTypes'
import { useStaticData } from 'vite-plugin-react-pages/client'
import { useLocation } from 'react-router-dom'

import AppLayout, { MDX } from './Layout'
import { themeConfigCtx, themePropsCtx, themeCtx } from './ctx'

import './style.less'
import { Demo } from './Layout/Demo'
import AnchorLink from './components/AnchorLink'
import type { ThemeConfig, ThemeContextValue } from './ThemeConfig.doc'
import { normalizeI18nConfig, useIsomorphicLayoutEffect } from './utils'
import { getPageGroups, matchPagePathLocalePrefix } from './analyzeStaticData'

export function createTheme(
  originalThemeConfig: ThemeConfig
): React.FC<React.PropsWithChildren<ThemeProps>> {
  // normalize themeConfig
  const themeConfig = {
    ...originalThemeConfig,
    search: originalThemeConfig.search ?? true,
    i18n: normalizeI18nConfig(originalThemeConfig.i18n),
  }

  const ThemeComp = (props: ThemeProps) => {
    const { loadState, loadedData } = props
    const staticData = useStaticData()

    const location = useLocation()
    useIsomorphicLayoutEffect(() => {
      // scroll to anchor link after page component loaded
      if (loadState.type === 'loaded') {
        if (location.hash) {
          AnchorLink.scrollToAnchor(decodeURIComponent(location.hash.slice(1)))
          return
        }
      }
      window.scrollTo(0, 0)
    }, [loadState, location.hash])

    if (loadState.type === 'loading') {
      const ComponentLoading = themeConfig.ComponentLoading
      return (
        <AppLayout>{ComponentLoading ? <ComponentLoading /> : null}</AppLayout>
      )
    }

    if (loadState.type === 'load-error') {
      const errMsg = loadState.error?.message
      return (
        <AppLayout>
          <h1>Load Error</h1>
          {errMsg && <p>{errMsg}</p>}
        </AppLayout>
      )
    }

    const pageData = loadedData[loadState.routePath]

    if (loadState.type === '404' || !pageData) {
      const Comp404 = themeConfig.Component404
      return (
        <AppLayout>{Comp404 ? <Comp404 /> : <p>Page not found.</p>}</AppLayout>
      )
    }

    const pageStaticData = staticData[loadState.routePath]

    const body = Object.entries(pageData)
      // the dataPiece with key 'outlineInfo' is not for render
      .filter(([key]) => key !== 'outlineInfo')
      .map(([key, dataPart], idx) => {
        const ContentComp = (dataPart as any).default
        const pageStaticDataPart = pageStaticData?.[key]
        const content = (() => {
          if (pageStaticDataPart?.sourceType === 'md')
            return (
              <MDX>
                <ContentComp />
              </MDX>
            )
          if (dataPart?.isDemo)
            return <Demo style={{ margin: '16px 45px' }} {...dataPart} />
          return <ContentComp />
        })()
        const result = <React.Fragment key={key}>{content}</React.Fragment>
        let order = Number(pageStaticDataPart?.order || 1)
        if (Number.isNaN(order)) order = 1
        return { key, result, order }
      })
      .sort((a, b) => {
        // sort by (order, key)
        if (a.order !== b.order) return a.order - b.order
        return a.key.localeCompare(b.key)
      })
      .map(({ result }) => result)

    return <AppLayout>{body}</AppLayout>
  }

  return withThemeRootWrapper(ThemeComp)

  function withThemeRootWrapper(
    Component: React.FC<React.PropsWithChildren<ThemeProps>>
  ) {
    const HOC: React.FC<React.PropsWithChildren<ThemeProps>> = (props) => {
      const { loadState, loadedData } = props
      const staticData = useStaticData()
      const themeCtxValue: ThemeContextValue = useMemo(() => {
        const pageGroups = getPageGroups(staticData, themeConfig.i18n)
        const result: ThemeContextValue = {
          ...props,
          themeConfig,
          staticData,
          resolvedLocale: {},
          pageGroups,
        }
        if (!result.themeConfig.i18n?.locales) return result
        const { locale, localeKey, pagePathWithoutLocalePrefix } =
          matchPagePathLocalePrefix(
            loadState.routePath,
            result.themeConfig.i18n
          )
        Object.assign(result.resolvedLocale, {
          locale,
          localeKey,
          pagePathWithoutLocalePrefix,
        })
        return result
      }, [loadState, loadedData, staticData])

      let children = <Component {...props} />
      if (themeConfig.AppWrapper) {
        children = <themeConfig.AppWrapper>{children}</themeConfig.AppWrapper>
      }

      // TODO: improve context usage
      // use less context and make it more efficient
      return (
        <themeConfigCtx.Provider value={themeConfig}>
          <themePropsCtx.Provider value={props}>
            <themeCtx.Provider value={themeCtxValue}>
              {children}
            </themeCtx.Provider>
          </themePropsCtx.Provider>
        </themeConfigCtx.Provider>
      )
    }
    return HOC
  }
}

export { defaultSideNavs } from './Layout/Sider'
export type { DefaultSideNavsOpts } from './Layout/Sider'
export { Demo } from './Layout/Demo'
export { TsInfo } from './Layout/TsInfo'
export { FileText } from './Layout/FileText'
export type {
  ThemeConfig,
  LocalConfig,
  I18nConfig,
  ThemeContextValue,
  MenuConfig,
  FooterConfig,
  FooterColumn,
  FooterLink,
} from './ThemeConfig.doc'
export { useThemeCtx } from './ctx'

import { registerSSRPlugin } from 'vite-plugin-react-pages/client'
registerSSRPlugin(() => import('./ssrPlugin').then((mod) => mod.default))
