import type { MenuConfig } from './Layout/renderMenu'
import type {
  LoadState,
  PagesLoaded,
} from 'vite-plugin-react-pages/clientTypes'

export interface ThemeConfig {
  /**
   * Logo at top bar
   */
  logo?: React.ReactNode
  /**
   * Logo link path
   * @defaultValue "/"
   */
  logoLink?: string | null
  /**
   * Navigation menu at top bar.
   */
  topNavs?: ReadonlyArray<MenuConfig>
  /**
   * Side menu.
   */
  sideNavs?:
    | ReadonlyArray<MenuConfig>
    | ((ctx: SideNavsContext) => ReadonlyArray<MenuConfig> | null | undefined)
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
  defaultLocale: string
  locales: Record<string, LocalConfig>
}

export interface SideNavsContext {
  readonly loadState: LoadState
  readonly loadedData: PagesLoaded
  readonly staticData: Record<string, any>
  readonly i18n: I18nConfig | undefined
}

export interface LocalConfig {
  /** this will be set as the lang attribute on <html> */
  lang?: string
  /**
   * this label will be used when rendering the locale
   * in the locale selector
   */
  label?: string
  routePrefix?: string
}
