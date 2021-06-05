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
    // this is a first-level page .e.g /xxx

    /**
     * current page is a index page for a page group
     * .e.g /guide should not be treated like normal first-level page
     * It should be grouped with /guide/start, /guide/advanced .etc
     */
    let currentPageIsGroupIndexPage = false
    const result = Object.entries(staticData)
      // show all first-level pages  ( like /xxx or / )
      .filter(([pagePath]) => {
        if (pagePath === '/404') return false
        if (removeStartSlash(pagePath).split('/').length === 1) {
          const foundSameGroupPage = Object.keys(staticData).find((finding) =>
            finding.startsWith(pagePath + '/')
          )
          // pagePath page belongs to a page group
          if (foundSameGroupPage) {
            if (pagePath === loadState.routePath)
              currentPageIsGroupIndexPage = true
            return false
          }
          return true
        }
        return false
      })
      .map(([pagePath, pageStaticData]) => {
        return {
          label: pagePath,
          path: pagePath,
        }
      })
    if (!currentPageIsGroupIndexPage) {
      // this is a normal first-level page
      // '/' page don't show sideNav if it is the only first-level page
      if (result.length === 1 && loadState.routePath === '/') return null
      return result
    }
  }

  // show all pages with this pathPrefix (.e.g /guide)
  const pathPrefix = '/' + seg[0]

  // sub-groups within this page group
  const subGroups: Record<
    string,
    { pagePath: string; pageStaticData: any; pageName: string }[]
  > = {}
  function ensureGroup(key: string) {
    if (!subGroups[key]) return (subGroups[key] = [])
    return subGroups[key]
  }

  Object.entries(staticData).filter(([pagePath, pageStaticData]) => {
    if (pagePath === pathPrefix) {
      // this page is the '/' index page for this pathPrefix
      // show it
      ensureGroup('/').push({ pagePath, pageStaticData, pageName: '/' })
      return
    }
    if (pagePath.startsWith(`${pathPrefix}/`)) {
      // this page is belongs to this pathPrefix
      // show it
      const left = pagePath.substr(pathPrefix.length + 1)
      const leftSeg = left.split('/')
      if (leftSeg.length === 0) {
        throw new Error('leftSeg assertion fail')
      }
      if (leftSeg.length === 1) {
        // this page is first-level page(don't have sub-group) for this pathPrefix
        ensureGroup('/').push({
          pagePath,
          pageStaticData,
          pageName: leftSeg[0],
        })
        return
      }
      // this page belongs to a sub-group
      // for example /pathPrefix/sub-group/pagename have sub-group named "sub-group"
      const groupKey = leftSeg[0]
      const pageName = leftSeg.slice(1).join('/')
      ensureGroup(groupKey).push({ pagePath, pageStaticData, pageName })
    }
  })

  const result: MenuConfig[] = []

  Object.entries(subGroups)
    .sort(([groupKeyA], [groupKeyB]) => {
      if (groupKeyA === '/') return -1
      if (groupKeyB === '/') return 1
      return groupKeyA.localeCompare(groupKeyB)
    })
    .map(([groupKey, pages]) => {
      if (groupKey === '/') {
        pages.forEach((page) => {
          result.push({
            label: page.pageName,
            path: page.pagePath,
          })
        })
        return
      }
      result.push({
        group: groupKey,
        children: pages.map((page) => {
          return {
            label: page.pageName,
            path: page.pagePath,
          }
        }),
      })
    })
  // console.log('pathPrefix', pathPrefix, 'subGroups', subGroups)
  return result
}

function removeStartSlash(pagePath: string) {
  return pagePath.replace(/^\//, '')
}
