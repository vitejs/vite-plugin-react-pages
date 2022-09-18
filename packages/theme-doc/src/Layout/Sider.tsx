import React, { useContext } from 'react'
import { Menu, Drawer } from 'antd'

import { MenuConfig, renderMenuHelper } from './renderMenu'
import { themePropsCtx } from '../ctx'
import s from './index.module.less'
import type { ThemeContextValue } from '..'
import { LayoutContext } from './ctx'
import { getOnePageGroupInfo } from '../analyzeStaticData'
import { getStaticDataValue } from '../utils'

interface Props {
  sideNavsData: readonly MenuConfig[] | null | undefined
}

const renderMenu = renderMenuHelper(false)

const AppSider: React.FC<Props> = ({ sideNavsData }) => {
  const themeProps = useContext(themePropsCtx)
  const subMenuKeys: string[] = []
  const menuItems = sideNavsData
    ? renderMenu(sideNavsData, true, subMenuKeys)
    : []
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
            // use loadState.routePath instead of location.pathname
            // because location.pathname may contain trailing slash
            selectedKeys={[themeProps.loadState.routePath]}
            defaultOpenKeys={subMenuKeys}
            inlineIndent={30}
            items={menuItems}
          />
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
            // use loadState.routePath instead of location.pathname
            // because location.pathname may contain trailing slash
            selectedKeys={[themeProps.loadState.routePath]}
            defaultOpenKeys={subMenuKeys}
            inlineIndent={30}
            items={menuItems}
          />
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
  { loadState, staticData, themeConfig, pageGroups }: ThemeContextValue,
  opts?: DefaultSideNavsOpts
): MenuConfig[] | null {
  const { i18n } = themeConfig || {}
  const currentGroupInfo = getOnePageGroupInfo(
    loadState.routePath,
    staticData[loadState.routePath],
    i18n
  )
  // console.log('defaultSideNavs', currentGroupInfo, groups)

  // groupKey of the current page
  const groupKey = (() => {
    if (opts?.forceGroup) return opts.forceGroup
    // infer the group of the current page.
    // currentGroupInfo.group may be wrong because:
    // if there is also pages like /guide/start ,
    // then /guide should not be grouped with /faq .
    // instead, /guide should be moved to the "guide" group
    if (
      currentGroupInfo.group === '/' &&
      pageGroups[currentGroupInfo.pageKeyInGroup]
    ) {
      return currentGroupInfo.pageKeyInGroup
    }
    return currentGroupInfo.group
  })()

  const subGroups = pageGroups[groupKey] ?? {}

  const result: MenuConfig[] = []

  Object.entries(subGroups)
    // remove pages with different locale
    .map(([subGroupKey, pages]) => {
      const filtered = pages.filter(
        ({ pageLocaleKey }) => currentGroupInfo.localeKey === pageLocaleKey
      )
      return [subGroupKey, filtered] as const
    })
    // if all pages of a subGroup are filtered out, drop it
    .filter(([subGroupKey, pages]) => pages.length > 0)
    // sort subGroup
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
            result.push({
              label: page.pageTitle,
              path: page.pagePath,
            })
          })
        return
      }
      const subGroupLabel =
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
          return {
            label: page.pageTitle,
            path: page.pagePath,
          }
        })
      if (subGroupItems.length > 0)
        result.push({
          group: subGroupLabel,
          children: subGroupItems,
        })
    })
  return result

  function getGroupConfig(groupKey: string, subGroupKey: string) {
    return opts?.groupConfig?.[groupKey]?.[subGroupKey]
  }
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
