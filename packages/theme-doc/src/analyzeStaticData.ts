import type { I18nConfig, LocalConfig } from '.'
import { ensureStartSlash, getStaticDataValue, removeStartSlash } from './utils'

// map groups -> subgroups -> pages
export type PageGroups = {
  [groupKey: string]: {
    [subGroupKey: string]: PageMeta[]
  }
}

export type PageMeta = {
  pageStaticData: any
  // pagePath is parsed into three part:
  // /${groupKey}/${subGroupKey}/${pageKeyInGroup}
  pagePath: string
  groupKey: string
  subGroupKey: string
  pageKeyInGroup: string
  // pageTitle is extracted from frontmatter or markdown title
  // use pageKeyInGroup as fallback
  pageTitle: string
  pageLocale: LocalConfig | undefined
  pageLocaleKey: string | undefined
}

export function getPageGroups(staticData: any, i18n: I18nConfig | undefined) {
  const groups: PageGroups = {}
  function ensureGroup(group: string): Record<string, PageMeta[]>
  function ensureGroup(group: string, subGroup: string): PageMeta[]
  function ensureGroup(group: string, subGroup?: string) {
    const subGroups = (groups[group] ||= {})
    if (!subGroup) return subGroups
    return (subGroups[subGroup] ||= [])
  }

  Object.entries(staticData).forEach(([pagePath, pageStaticData]) => {
    if (pagePath === '/404') return
    const pageGroupInfo = getOnePageGroupInfo(pagePath, pageStaticData, i18n)
    ensureGroup(pageGroupInfo.group, pageGroupInfo.subGroup).push({
      pageStaticData,
      pagePath,
      groupKey: pageGroupInfo.group,
      subGroupKey: pageGroupInfo.subGroup,
      pageKeyInGroup: pageGroupInfo.pageKeyInGroup,
      pageTitle: pageGroupInfo.pageTitle,
      pageLocale: pageGroupInfo.locale,
      pageLocaleKey: pageGroupInfo.localeKey,
    })
  })

  const rootGroup = groups['/']?.['/']
  if (rootGroup) {
    const filtered = rootGroup.filter((page) => {
      if (page.pageKeyInGroup === '/') return true
      if (groups[page.pageKeyInGroup]) {
        // it is explicit grouped
        if (getStaticDataValue(page.pageStaticData, 'group')) return true
        // if there is also pages like /guide/start
        // then /guide should not be grouped with /faq
        // instead, /guide should be moved to the "guide" group
        ensureGroup(page.pageKeyInGroup, '/').push(page)
        return false
      }
      return true
    })
    groups['/']['/'] = filtered
  }

  return groups
}

export function getOnePageGroupInfo(
  pagePath: string,
  pageStaticData: any,
  i18n: I18nConfig | undefined
): {
  group: string
  subGroup: string
  pageKeyInGroup: string
  pageTitle: string
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
  const pageKeyInGroup: string = seg[seg.length - 1] || '/'
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
    pageKeyInGroup,
    pageTitle: getStaticDataValue(pageStaticData, 'title') ?? pageKeyInGroup,
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
