import React, { useContext } from 'react'
import { Menu, Drawer } from 'antd'

import { MenuConfig, renderMenuHelper } from './renderMenu'
import { themePropsCtx } from '../ctx'
import s from './index.module.less'
import type { ThemeContextValue, I18nConfig, LocalConfig } from '..'
import { LayoutContext } from './ctx'
import { ensureStartSlash, removeStartSlash } from '../utils'

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
  { loadState, staticData, themeConfig }: ThemeContextValue,
  opts?: DefaultSideNavsOpts
): MenuConfig[] | null {
  const { i18n } = themeConfig || {}
  const currentGroupInfo = getPageGroupInfo(
    loadState.routePath,
    staticData[loadState.routePath],
    i18n
  )
  const groups = getGroups(staticData, i18n)
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
    [subGroupKey: string]: PageMeta[]
  }
}

type PageMeta = {
  pagePath: string
  pageStaticData: any
  pageName: string
  pageLocale: LocalConfig | undefined
  pageLocaleKey: string | undefined
}

function getGroups(staticData: any, i18n: I18nConfig | undefined) {
  const groups: Groups = {}
  function ensureGroup(group: string): Record<string, PageMeta[]>
  function ensureGroup(group: string, subGroup: string): PageMeta[]
  function ensureGroup(group: string, subGroup?: string) {
    const subGroups = (groups[group] ||= {})
    if (!subGroup) return subGroups
    return (subGroups[subGroup] ||= [])
  }

  Object.entries(staticData).forEach(([pagePath, pageStaticData]) => {
    if (pagePath === '/404') return
    const pageGroupInfo = getPageGroupInfo(pagePath, pageStaticData, i18n)
    ensureGroup(pageGroupInfo.group, pageGroupInfo.subGroup).push({
      pagePath,
      pageStaticData,
      pageName: pageGroupInfo.pageName,
      pageLocale: pageGroupInfo.locale,
      pageLocaleKey: pageGroupInfo.localeKey,
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
  pageStaticData: any,
  i18n: I18nConfig | undefined
): {
  group: string
  subGroup: string
  pageName: string
  locale: LocalConfig | undefined
  localeKey: string | undefined
} {
  if (!pagePath.startsWith('/'))
    throw new Error(`expect pagePath.startsWith('/'). pagePath: ${pagePath}`)
  const { pagePathWithoutLocalePrefix, locale, localeKey } =
    matchPagePathLocalePrefix(pagePath, i18n)
  const seg = removeStartSlash(pagePathWithoutLocalePrefix).split('/')
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
    locale,
    localeKey,
  }
}

export function matchPagePathLocalePrefix(
  pagePath: string,
  i18n: I18nConfig | undefined
) {
  const result = {
    pagePathWithoutLocalePrefix: pagePath,
    localeKey: undefined as string | undefined,
    locale: undefined as LocalConfig | undefined,
  }
  if (!i18n?.locales) return result

  Object.entries(i18n.locales).forEach(([localeKey, locale]) => {
    const prefix = locale.routePrefix || ensureStartSlash(localeKey)
    if (
      pagePath.startsWith(prefix) &&
      // routePrefix '/' has lower priority than '/any-prefix'
      (!result.locale || result.locale.routePrefix === '/')
    ) {
      result.pagePathWithoutLocalePrefix = ensureStartSlash(
        pagePath.slice(prefix.length)
      )
      result.localeKey = localeKey
      result.locale = locale
    }
  })
  // fallback to defaultLocale
  if (
    !result.locale &&
    i18n.defaultLocale &&
    i18n.locales[i18n.defaultLocale]
  ) {
    result.localeKey = i18n.defaultLocale
    result.locale = i18n.locales[i18n.defaultLocale]
  }
  return result
}
