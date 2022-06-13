import React, { useContext, useMemo } from 'react'
import { Menu, Dropdown } from 'antd'
import { useLocation, Link, matchPath } from 'react-router-dom'
import { useStaticData } from 'vite-plugin-react-pages/client'
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'

import s from './index.module.less'
import { themeConfigCtx } from '../ctx'
import { renderMenuHelper } from './renderMenu'
import type { MenuConfig } from './renderMenu'
import { LayoutContext } from './ctx'

const renderMenu = renderMenuHelper(true)

interface Props {}

const AppHeader: React.FC<Props> = (props) => {
  const themeConfig = useContext(themeConfigCtx)
  const { TopBarExtra, topNavs } = themeConfig
  const location = useLocation()
  const indexPagestaticData = useStaticData('/')
  const layoutCtxVal = useContext(LayoutContext)

  const logoLink = (() => {
    if (themeConfig.logoLink !== undefined) return themeConfig.logoLink
    if (indexPagestaticData) {
      return '/'
    }
  })()

  const renderLogo = (() => {
    if (logoLink) {
      return (
        <Link to={logoLink} className={s.logoLink}>
          {themeConfig.logo}
        </Link>
      )
    }
    return themeConfig.logo
  })()

  const activeKeys: string[] = useMemo(() => {
    const result = (topNavs ?? []).map(getActiveKeyIfMatch).filter(Boolean)
    if (!result.includes(location.pathname)) result.push(location.pathname)
    return result as string[]

    function getActiveKeyIfMatch(item: MenuConfig) {
      if ('path' in item) {
        const matcher = item.activeIfMatch ?? {
          path: item.path,
          exact: true,
        }
        const match = matchPath(location.pathname, matcher)
        if (match) return item.path
      } else if ('subMenu' in item) {
        if (item.activeIfMatch) {
          const match = matchPath(location.pathname, item.activeIfMatch)
          if (match) return item.subMenu
        }
        const match = item.children.some(getActiveKeyIfMatch)
        if (match) return item.subMenu
      }
      return false
    }
  }, [location.pathname, topNavs])

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

      {topNavs && (
        <>
          <div className={s.navCtn}>
            <Menu
              className={s.nav}
              mode="horizontal"
              selectedKeys={activeKeys}
              disabledOverflow
              items={renderMenu(topNavs, true)}
            />
          </div>
          <div className={s.triggerCtn}>
            <Dropdown
              placement="bottomRight"
              overlay={
                <Menu selectedKeys={activeKeys} disabledOverflow items={renderMenu(topNavs, true)} />
              }
            >
              <span className={s.trigger}>
                <UnorderedListOutlined />
              </span>
            </Dropdown>
          </div>
        </>
      )}

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
