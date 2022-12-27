import React, { useContext, useMemo } from 'react'
import { Menu, Dropdown } from 'antd'
import { Link, matchPath, PathPattern } from 'react-router-dom'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'

import s from './index.module.less'
import { renderMenuHelper } from './renderMenu'
import type { MenuConfig } from './renderMenu'
import { LayoutContext } from './ctx'
import { themeConfigCtx, useThemeCtx } from '../ctx'
import { useLocaleSelector } from './useLocaleSelector'
import Search from './Search'

const renderMenu = renderMenuHelper(true)

interface Props {}

const AppHeader: React.FC<React.PropsWithChildren<Props>> = (props) => {
  const themeConfig = useContext(themeConfigCtx)
  const { TopBarExtra, topNavs } = themeConfig
  const layoutCtxVal = useContext(LayoutContext)
  const { render: renderLocaleSelector } = useLocaleSelector()
  const themeCtxValue = useThemeCtx()
  const {
    loadState: { routePath },
    resolvedLocale: { locale, localeKey },
    staticData,
  } = themeCtxValue

  const renderLogo = (() => {
    const logoLink = (() => {
      let result: string | undefined | null
      if (typeof themeConfig.logoLink === 'function') {
        result = themeConfig.logoLink(themeCtxValue)
      } else {
        result = themeConfig.logoLink
      }
      if (result === undefined) {
        // infer home page path based on current matched locale
        // for example, /page1 will infer home path to /
        // /zh/page1 will infer home path to /zh
        result = locale?.routePrefix || '/'
        // if the infered page path doesn't exist, drop it
        if (!staticData[result]) result = null
      }
      return result
    })()
    const resolvedLogo = (() => {
      if (typeof themeConfig.logo === 'function')
        return themeConfig.logo(themeCtxValue)
      return themeConfig.logo
    })()
    if (logoLink) {
      return (
        <Link to={logoLink} className={s.logoLink}>
          {resolvedLogo}
        </Link>
      )
    }
    return resolvedLogo
  })()

  const resolvedTopNavs = useMemo(() => {
    if (typeof topNavs === 'function') return topNavs(themeCtxValue)
    return topNavs
  }, [themeCtxValue])

  const activeKeys: string[] = useMemo(() => {
    const result = (resolvedTopNavs ?? [])
      .map(getActiveKeyIfMatch)
      .filter(Boolean)
    if (!result.includes(routePath)) result.push(routePath)
    return result as string[]

    function getActiveKeyIfMatch(item: MenuConfig) {
      if ('path' in item) {
        const matcher =
          item.activeIfMatch ??
          ({
            path: item.path,
            // if activeIfMatch is not given,
            // do exact match by default
            end: true,
          } as PathPattern<string>)
        const matchResult = matchUtil(matcher)
        if (matchResult) return item.path
      } else if ('subMenu' in item) {
        if (item.activeIfMatch) {
          const matchResult = matchUtil(item.activeIfMatch)
          if (matchResult) return item.subMenu
        }
        const childrenMatchResult = item.children.some(getActiveKeyIfMatch)
        if (childrenMatchResult) return item.subMenu
      }
      return false

      function matchUtil(
        matcher: string | string[] | PathPattern<string> | PathPattern<string>[]
      ): boolean {
        if (!Array.isArray(matcher)) {
          let actualMatcher: PathPattern<string>
          if (typeof matcher === 'string') {
            actualMatcher = {
              path: matcher,
              // if users pass activeIfMatch as string
              // do prefix match (instead of exact match)
              end: false,
            }
          } else {
            actualMatcher = matcher
          }
          // use loadState.routePath instead of location.pathname
          // because location.pathname may contain trailing slash
          return !!matchPath(actualMatcher, routePath)
        } else {
          return matcher.some((oneMatcher) => {
            return !!matchPath(oneMatcher, routePath)
          })
        }
      }
    }
  }, [routePath, resolvedTopNavs])

  return (
    <header className={s.header}>
      <div className={s.triggerCtn}>
        <span
          className={s.trigger}
          onClick={() => {
            layoutCtxVal.setIsSlideSiderOpen((v) => !v)
          }}
        >
          {React.createElement(
            layoutCtxVal.isSlideSiderOpen
              ? MenuUnfoldOutlined
              : MenuFoldOutlined
          )}
        </span>
      </div>
      <div className={s.logoArea}>{renderLogo}</div>

      {themeConfig.search && (
        <div className={s.searchArea}>
          <Search />
        </div>
      )}

      <div className={s.flexSpace}></div>

      {resolvedTopNavs && (
        <>
          <div className={s.navCtn}>
            <Menu
              className={s.nav}
              mode="horizontal"
              selectedKeys={activeKeys}
              disabledOverflow
              items={renderMenu(resolvedTopNavs, true)}
            />
          </div>
          <div className={s.triggerCtn}>
            <Dropdown
              placement="bottomRight"
              menu={{
                selectedKeys: activeKeys,
                disabledOverflow: true,
                items: renderMenu(resolvedTopNavs, true),
              }}
            >
              <span className={s.trigger}>
                <UnorderedListOutlined />
              </span>
            </Dropdown>
          </div>
        </>
      )}

      <div className={s.localeSelectorCtn}>{renderLocaleSelector()}</div>

      {TopBarExtra ? (
        <div className={s.extraCtn}>
          <TopBarExtra />
        </div>
      ) : (
        <div className={s.alignNavWithContent}></div>
      )}
    </header>
  )
}

export default AppHeader
