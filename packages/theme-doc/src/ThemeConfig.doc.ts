import type { MenuConfig } from './Layout/renderMenu'
import type {
  PagesStaticData,
  ThemeProps,
} from 'vite-plugin-react-pages/clientTypes'

export interface ThemeConfig {
  /**
   * Logo at top bar
   */
  logo?: React.ReactNode | ((ctx: ThemeContextValue) => React.ReactNode)
  /**
   * Logo link path
   * @defaultValue "/"
   */
  logoLink?:
    | string
    | null
    | undefined
    | ((ctx: ThemeContextValue) => string | null | undefined)
  /**
   * Navigation menu at top bar.
   */
  topNavs?:
    | ReadonlyArray<MenuConfig>
    | ((ctx: ThemeContextValue) => ReadonlyArray<MenuConfig> | null | undefined)
  /**
   * Side menu.
   */
  sideNavs?:
    | ReadonlyArray<MenuConfig>
    | ((ctx: ThemeContextValue) => ReadonlyArray<MenuConfig> | null | undefined)
  /**
   * Extra area at top bar.
   */
  TopBarExtra?: React.ComponentType
  /**
   * view to be rendered when app in 404 state
   * (url not matching any page)
   */
  Component404?: React.ComponentType
  i18n?: I18nConfig
}

export interface I18nConfig {
  /**
   * The localeKey of default locale
   * If a page have pagePath that doesn't match any `LocalConfig.routePrefix`,
   *  the `I18nConfig.defaultLocale` will apply to it
   */
  defaultLocale: string
  /**
   * If true, this theme will render a locale selector at topbar
   * Only matters when you have more than one locales
   * @defaultValue true
   */
  topBarLocaleSelector?: boolean
  /**
   * Define all locales that your site supports
   * Map localeKey to locale config
   */
  locales: Record<string, LocalConfig>
}

export interface LocalConfig {
  /** This will be set as the lang attribute on <html> */
  lang?: string
  /**
   * This label will be used when rendering the locale
   * in the locale selector
   */
  label?: string
  /**
   * If a page have pagePath with this prefix, this locale will apply to it
   * If a page have pagePath that doesn't match any routePrefix,
   *  the `I18nConfig.defaultLocale` will apply to it
   */
  routePrefix?: string
}

export type ThemeContextValue = ThemeProps & {
  themeConfig: ThemeConfig
  staticData: PagesStaticData
  resolvedLocale: {
    locale?: LocalConfig
    localeKey?: string
    pagePathWithoutLocalePrefix?: string
  }
}

export type { MenuConfig }
