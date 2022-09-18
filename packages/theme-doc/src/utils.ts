import type { I18nConfig, LocalConfig } from './ThemeConfig.doc'

export function withClsPrefix(cls: string) {
  return `vp-theme-${cls}`
}

export function removeStartSlash(s: string) {
  return s.replace(/^\//, '')
}

export function removeTrailingSlash(s: string) {
  return s.replace(/\/$/, '')
}

export function ensureStartSlash(s: string) {
  return '/' + removeStartSlash(s)
}

export function normalizeI18nConfig(
  i18n: I18nConfig | undefined
): I18nConfig | undefined {
  if (!i18n) return i18n
  const newLocales = Object.fromEntries(
    Object.entries(i18n.locales).map(([key, locale]) => {
      const newLocale: LocalConfig = { ...locale }
      if (newLocale.label === undefined) newLocale.label = key
      if (newLocale.lang === undefined) newLocale.lang = key
      if (newLocale.routePrefix === undefined) newLocale.routePrefix = key
      newLocale.routePrefix = ensureStartSlash(
        removeTrailingSlash(newLocale.routePrefix)
      )
      return [key, locale]
    })
  )
  return { ...i18n, locales: newLocales }
}

export function getStaticDataValue(pageStaticData: any, key: string) {
  return pageStaticData?.[key] ?? pageStaticData?.main?.[key]
}
