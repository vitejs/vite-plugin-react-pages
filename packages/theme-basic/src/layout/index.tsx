import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Nav, Shell, ConfigProvider } from '@alifd/next'
import 'github-markdown-css/github-markdown.css'
import type { PagesStaticData } from 'vite-plugin-react-pages'

import s from './style.module.css'
import './global.css'
import SiteSearch from './search'

interface Props {
  readonly sideMenuData: ReadonlyArray<SideMenuData>
  readonly topNavs: ReadonlyArray<TopNavData>
  readonly logo: React.ReactNode
  readonly path?: string
  readonly footer?: React.ReactNode
  readonly pagesStaticData?: PagesStaticData
  readonly topbarOperations?: React.ReactNode
  readonly search?: boolean
}

const Layout: React.FC<Props> = ({
  sideMenuData,
  topNavs,
  logo,
  path,
  children,
  footer,
  pagesStaticData,
  topbarOperations,
  search,
}) => {
  const location = useLocation()
  return (
    <ConfigProvider prefix="vp-theme-">
      <Shell className={s.layout}>
        <Shell.Branding>{logo} </Shell.Branding>
        <Shell.Action>
          {topbarOperations}
          {search && pagesStaticData && (
            <SiteSearch pagesStaticData={pagesStaticData} />
          )}
          {topNavs && (
            <Nav direction="hoz" embeddable selectedKeys="">
              {renderNav(topNavs)}
            </Nav>
          )}
        </Shell.Action>

        <Shell.Navigation trigger={null}>
          <Nav embeddable selectedKeys={location.pathname}>
            {renderNav(sideMenuData)}
          </Nav>
        </Shell.Navigation>

        <Shell.Content className={s.content} key={path}>
          {/* reset prefix setting for user content */}
          <ConfigProvider prefix="next-">
            <>{children}</>
          </ConfigProvider>
        </Shell.Content>

        {footer && <Shell.Footer>{footer}</Shell.Footer>}
      </Shell>
    </ConfigProvider>
  )
}

export default Layout

export type SideMenuData = { readonly text: string; readonly path: string }

export type TopNavData =
  | {
      readonly text: string
      /**
       * The url.
       * @example 'https://www.google.com/'
       */
      readonly href: string
    }
  | {
      readonly text: string
      /**
       * The path in the current webapp.
       * @example '/posts/hello-world'
       */
      readonly path: string
    }
  | {
      /**
       * The label of the subnav
       */
      readonly subNav: string
      readonly children: ReadonlyArray<TopNavData>
    }
  | {
      /**
       * The label of the nav group
       */
      readonly group: string
      readonly children: ReadonlyArray<TopNavData>
    }

export function renderNav(navs: ReadonlyArray<TopNavData>) {
  return navs.map((item, idx) => {
    if ('path' in item) {
      return (
        <Nav.Item key={item.path}>
          <Link
            to={(location) => {
              if (location.search) {
                // preserve query
                return `${item.path}${location.search}`
              }
              return item.path
            }}
          >
            {item.text}
          </Link>
        </Nav.Item>
      )
    }
    if ('href' in item) {
      return (
        <Nav.Item key={item.href}>
          <a href={item.href} target="_blank">
            {item.text}
          </a>
        </Nav.Item>
      )
    }
    if ('group' in item) {
      return (
        <Nav.Group label={item.group} key={idx}>
          {renderNav(item.children)}
        </Nav.Group>
      )
    }
    if ('subNav' in item) {
      return (
        <Nav.SubNav label={item.subNav} key={idx}>
          {renderNav(item.children)}
        </Nav.SubNav>
      )
    }
    throw new Error(`unexpected nav`)
  })
}
