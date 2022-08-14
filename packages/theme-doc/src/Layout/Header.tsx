import React, { useContext, useMemo } from 'react'
import { Menu, Dropdown } from 'antd'
import { Link, matchPath } from 'react-router-dom'
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

const renderMenu = renderMenuHelper(true)

interface Props {}

const AppHeader: React.FC<Props> = (props) => {
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
        const matcher = item.activeIfMatch ?? {
          path: item.path,
          exact: true,
        }
        // use loadState.routePath instead of location.pathname
        // because location.pathname may contain trailing slash
        const match = matchPath(routePath, matcher)
        if (match) return item.path
      } else if ('subMenu' in item) {
        if (item.activeIfMatch) {
          const match = matchPath(routePath, item.activeIfMatch)
          if (match) return item.subMenu
        }
        const match = item.children.some(getActiveKeyIfMatch)
        if (match) return item.subMenu
      }
      return false
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
              overlay={
                <Menu
                  selectedKeys={activeKeys}
                  disabledOverflow
                  items={renderMenu(resolvedTopNavs, true)}
                />
              }
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
