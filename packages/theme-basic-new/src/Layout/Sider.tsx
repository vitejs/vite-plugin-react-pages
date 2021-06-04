import React, { useContext } from 'react'
import { Layout, Menu } from 'antd'
import { useLocation } from 'react-router-dom'

import { MenuConfig, renderMenuHelper } from './renderMenu'
import { themeConfigCtx, themePropsCtx } from '../ctx'
import s from './index.module.less'
import type { ThemeContext } from '../index.common'

const { Sider } = Layout

interface Props {
  sideNavsData: readonly MenuConfig[] | null | undefined
}

const renderMenu = renderMenuHelper(false)

const AppSider: React.FC<Props> = ({ sideNavsData }) => {
  const themeProps = useContext(themePropsCtx)
  const location = useLocation()

  console.log('sideNavsData', sideNavsData)

  const subMenuKeys: string[] = []
  const menu = sideNavsData && renderMenu(sideNavsData, true, subMenuKeys)

  return (
    <div className={s.sider}>
      {sideNavsData && (
        <Menu
          className={s.sideMenu}
          // clear menu state when path change
          key={themeProps.loadState.routePath}
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={subMenuKeys}
          inlineIndent={30}
        >
          {menu}
        </Menu>
      )}
    </div>
  )
}

export default AppSider

export function defaultSideNav({
  loadState,
  staticData,
}: ThemeContext): MenuConfig[] | null {
  const seg = removeStartSlash(loadState.routePath).split('/')

  if (seg.length === 1) {
    // show all first-level pages  ( like /xxx or / )
    return Object.entries(staticData)
      .filter(([pagePath]) => {
        if (pagePath === '/404') return false
        if (removeStartSlash(pagePath).split('/').length === 1) {
          const found = Object.keys(staticData).find((finding) =>
            finding.startsWith(pagePath + '/')
          )
          // this page belongs to another realm
          if (found) return false
          return true
        }
      })
      .map(([pagePath, pageStaticData]) => {
        return {
          label: pagePath,
          path: pagePath,
        }
      })
  }

  // show all pages with pathPrefix in the side bar
  const pathPrefix = '/' + seg[0]

  const groups: Record<string, { pagePath: string; pageStaticData: any }[]> = {}
  function ensureGroup(key: string) {
    if (!groups[key]) return (groups[key] = [])
    return groups[key]
  }

  Object.entries(staticData).filter(([pagePath, pageStaticData]) => {
    if (pagePath === pathPrefix) {
      ensureGroup('/').push({ pagePath, pageStaticData })
      return
    }
    if (pagePath.startsWith(`${pathPrefix}/`)) {
      const left = pagePath.substr(pathPrefix.length + 1)
      const leftSeg = left.split('/')
      if (leftSeg.length === 0) {
        throw new Error('leftSeg assertion fail')
      }
      if (leftSeg.length === 1) {
        ensureGroup('/').push({ pagePath, pageStaticData })
        return
      }
      const groupKey = leftSeg[0]
      ensureGroup(groupKey).push({ pagePath, pageStaticData })
    }
  })

  const result: MenuConfig[] = []

  Object.entries(groups)
    .sort(([groupKeyA], [groupKeyB]) => {
      if (groupKeyA === '/') return -1
      if (groupKeyB === '/') return 1
      return groupKeyA.localeCompare(groupKeyB)
    })
    .map(([groupKey, pages]) => {
      if (groupKey === '/') {
        pages.forEach((page) => {
          result.push({
            label: page.pagePath,
            path: page.pagePath,
          })
        })
        return
      }
      result.push({
        group: groupKey,
        children: pages.map((page) => {
          return {
            label: page.pagePath,
            path: page.pagePath,
          }
        }),
      })
    })
  console.log('groups', groups, result)

  return result
}

function removeStartSlash(pagePath: string) {
  return pagePath.replace(/^\//, '')
}
