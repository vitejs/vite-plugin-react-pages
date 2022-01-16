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
}

export interface SideNavsContext {
  readonly loadState: LoadState
  readonly loadedData: PagesLoaded
  readonly staticData: Record<string, any>
}
