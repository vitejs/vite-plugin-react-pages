import React from 'react'
import { createTheme, defaultSideNavs, useThemeCtx } from './themeDev'
import { Button } from 'antd'
import Component404 from './404'
import { topNavsConfig } from './themeConfig/topNavs'
import { sideNavsConfig } from './themeConfig/sideNavs'

export default createTheme({
  i18n: {
    defaultLocale: 'en',
    topBarLocaleSelector: true,
    locales: {
      en: {
        label: 'English',
        lang: 'en', // this will be set as the `lang` attribute on <html>
        routePrefix: '/',
      },
      zh: {
        label: '中文',
        lang: 'zh-CN',
        routePrefix: '/zh',
      },
    },
  },
  AppWrapper: ({ children }) => {
    const themeCtx = useThemeCtx()
    // console.log('themeCtx', themeCtx)
    return <customCtx.Provider value={123}>{children}</customCtx.Provider>
  },
  logo: <div style={{ fontSize: '20px' }}>📘 Vite Pages</div>,
  topNavs: ({ resolvedLocale: { localeKey } }) => {
    return topNavsConfig[localeKey!]
  },
  TopBarExtra: () => {
    // TopBarExtra is a component, you can call useThemeCtx hook in it
    const themeCtx = useThemeCtx()
    // console.log('themeCtx', themeCtx)
    return (
      <Button size="small" style={{ verticalAlign: 'middle' }}>
        Extra
      </Button>
    )
  },
  sideNavs(ctx) {
    if (ctx.loadState.routePath.startsWith('/users')) {
      return null
    }
    const {
      resolvedLocale: { localeKey },
    } = ctx
    return defaultSideNavs(ctx, sideNavsConfig[localeKey!])
  },
  Component404,
})

const customCtx = React.createContext<any>({})
