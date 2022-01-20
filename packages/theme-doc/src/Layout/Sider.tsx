import React, { useContext } from 'react'
import { Menu, Drawer } from 'antd'
import { useLocation } from 'react-router-dom'

import { MenuConfig, renderMenuHelper } from './renderMenu'
import { themePropsCtx } from '../ctx'
import s from './index.module.less'
import type { SideNavsContext } from '..'
import { LayoutContext } from './ctx'

interface Props {
  sideNavsData: readonly MenuConfig[] | null | undefined
}

const renderMenu = renderMenuHelper(false)

const AppSider: React.FC<Props> = ({ sideNavsData }) => {
  const themeProps = useContext(themePropsCtx)
  const location = useLocation()
  const subMenuKeys: string[] = []
  const menu = sideNavsData && renderMenu(sideNavsData, true, subMenuKeys)
  const layoutCtxVal = useContext(LayoutContext)

  const isSmallScreen = !layoutCtxVal.screenWidth?.md

  return (
    <div className={s.sider}>
      {sideNavsData && (
        <>
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
        </>
      )}
      {isSmallScreen && (
        <Drawer
          placement="left"
          closable={false}
          visible={layoutCtxVal.isSlideSiderOpen}
          onClose={() => {
            layoutCtxVal.setIsSlideSiderOpen(false)
          }}
          style={{
            top: 64,
            height: 'calc(100vh - 64px)',
          }}
          bodyStyle={{
            padding: '12px 0px',
          }}
          getContainer=".vp-local-layout"
          width={280}
        >
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
        </Drawer>
      )}
    </div>
  )
}

export default AppSider

export interface DefaultSideNavsOpts {
  groupConfig: {
    [groupKey: string]: {
      [subGroupKey: string]: {
        label?: string
        order?: number
      }
    }
  }
  /**
   * force defaultSideNavs to treat it as curent page group.
   * for example, user can use this to
   * force side nav to display a group during 404 state
   */
  forceGroup?: string
}

export function defaultSideNavs(
  { loadState, staticData }: SideNavsContext,
  opts?: DefaultSideNavsOpts
): MenuConfig[] | null {
  const currentGroupInfo = getPageGroupInfo(
    loadState.routePath,
    staticData[loadState.routePath]
  )
  const groups = getGroups(staticData)
  // console.log('defaultSideNavs', currentGroupInfo, groups)

  // groupKey of the current page
  const groupKey = (() => {
    if (opts?.forceGroup) return opts.forceGroup
    // infer the group of the current page.
    // currentGroupInfo.group may be wrong because:
    // if there is also pages like /guide/start ,
    // then /guide should not be grouped with /faq .
    // instead, /guide should be moved to the "guide" group
    if (currentGroupInfo.group === '/' && groups[currentGroupInfo.pageName]) {
      return currentGroupInfo.pageName
    }
    return currentGroupInfo.group
  })()

  const subGroups = groups[groupKey] ?? {}

  const result: MenuConfig[] = []

  Object.entries(subGroups)
    .sort(([subGroupKeyA], [subGroupKeyB]) => {
      // pages with '/' subGroup are put afront
      if (subGroupKeyA === '/') return -1
      if (subGroupKeyB === '/') return 1
      const orderA = getGroupConfig(groupKey, subGroupKeyA)?.order ?? 1
      const orderB = getGroupConfig(groupKey, subGroupKeyB)?.order ?? 1
      if (orderA !== orderB) return orderA - orderB
      return subGroupKeyA.localeCompare(subGroupKeyB)
    })
    .map(([subGroupKey, pages]) => {
      if (subGroupKey === '/') {
        pages
          .sort((pageA, pageB) =>
            sortPages(
              pageA.pageStaticData,
              pageB.pageStaticData,
              pageA.pagePath,
              pageB.pagePath
            )
          )
          // pages with path params should not be showed in sideNav
          .filter((page) => !page.pagePath.includes('/:'))
          .forEach((page) => {
            const label =
              getStaticDataValue(page.pageStaticData, 'title') ?? page.pageName
            result.push({
              label,
              path: page.pagePath,
            })
          })
        return
      }
      const groupLabel =
        getGroupConfig(groupKey, subGroupKey)?.label ?? subGroupKey

      const subGroupItems = pages
        .sort((pageA, pageB) =>
          sortPages(
            pageA.pageStaticData,
            pageB.pageStaticData,
            pageA.pagePath,
            pageB.pagePath
          )
        )
        // pages with path params should not be showed in sideNav
        .filter((page) => !page.pagePath.includes('/:'))
        .map((page) => {
          const label =
            getStaticDataValue(page.pageStaticData, 'title') ?? page.pageName
          return {
            label,
            path: page.pagePath,
          }
        })
      if (subGroupItems.length > 0)
        result.push({
          group: groupLabel,
          children: subGroupItems,
        })
    })
  return result

  function getGroupConfig(groupKey: string, subGroupKey: string) {
    return opts?.groupConfig?.[groupKey]?.[subGroupKey]
  }
}

function removeStartSlash(pagePath: string) {
  return pagePath.replace(/^\//, '')
}

function getStaticDataValue(pageStaticData: any, key: string) {
  return pageStaticData?.[key] ?? pageStaticData?.main?.[key]
}

function sortPages(
  pageStaticDataA: any,
  pageStaticDataB: any,
  pathA: string,
  pathB: string
) {
  const orderA = Number(getStaticDataValue(pageStaticDataA, 'order') ?? 1)
  const orderB = Number(getStaticDataValue(pageStaticDataB, 'order') ?? 1)
  if (!Number.isNaN(orderA) && !Number.isNaN(orderB) && orderA !== orderB)
    return orderA - orderB
  return pathA.localeCompare(pathB)
}

// map groups -> subgroups -> pages
type Groups = {
  [groupKey: string]: {
    [subGroupKey: string]: {
      pagePath: string
      pageStaticData: any
      pageName: string
    }[]
  }
}

function getGroups(staticData: any) {
  const groups: Groups = {}
  function ensureGroup(
    group: string
  ): Record<
    string,
    { pagePath: string; pageStaticData: any; pageName: string }[]
  >
  function ensureGroup(
    group: string,
    subGroup: string
  ): { pagePath: string; pageStaticData: any; pageName: string }[]
  function ensureGroup(group: string, subGroup?: string) {
    const subGroups = (groups[group] ||= {})
    if (!subGroup) return subGroups
    return (subGroups[subGroup] ||= [])
  }

  Object.entries(staticData).forEach(([pagePath, pageStaticData]) => {
    if (pagePath === '/404') return
    const pageGroupInfo = getPageGroupInfo(pagePath, pageStaticData)
    ensureGroup(pageGroupInfo.group, pageGroupInfo.subGroup).push({
      pagePath,
      pageStaticData,
      pageName: pageGroupInfo.pageName,
    })
  })

  const rootGroup = groups['/']?.['/']
  if (rootGroup) {
    const filtered = rootGroup.filter((page) => {
      if (page.pageName === '/') return true
      if (groups[page.pageName]) {
        // it is explicit grouped
        if (getStaticDataValue(page.pageStaticData, 'group')) return true
        // if there is also pages like /guide/start
        // then /guide should not be grouped with /faq
        // instead, /guide should be moved to the "guide" group
        ensureGroup(page.pageName, '/').push(page)
        return false
      }
      return true
    })
    groups['/']['/'] = filtered
  }

  return groups
}

function getPageGroupInfo(
  pagePath: string,
  pageStaticData: any
): {
  group: string
  subGroup: string
  pageName: string
} {
  if (!pagePath.startsWith('/')) throw new Error('getPageGroup assertion fail')
  const seg = removeStartSlash(pagePath).split('/')
  let group: string = getStaticDataValue(pageStaticData, 'group')
  let subGroup: string = getStaticDataValue(pageStaticData, 'subGroup')
  // used as default title
  const pageName: string = seg[seg.length - 1] || '/'
  if (seg.length === 1) {
    group ||= '/'
    subGroup ||= '/'
  } else if (seg.length === 2) {
    group ||= seg[0]
    subGroup ||= '/'
  } else if (seg.length >= 3) {
    group ||= seg[0]
    subGroup ||= seg[1]
  } else {
    throw new Error('getPageGroup assertion fail')
  }
  return {
    group,
    subGroup,
    pageName,
  }
}
