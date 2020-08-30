import React from 'react'
import { Link } from 'react-router-dom'
import { Nav, Shell, ConfigProvider } from '@alifd/next'
import 'github-markdown-css/github-markdown.css'
import type { IPagesStaticData } from 'vite-plugin-react-pages'

import s from './style.module.css'
import './global.css'
import SiteSearch from './search'

interface IProps {
  sideMenuData: ISideMenuData[]
  topNavs: ITopNavData[]
  logo: React.ReactNode
  path?: string
  footer?: React.ReactNode
  pagesStaticData?: IPagesStaticData
  topbarOperations?: React.ReactNode
  search?: boolean
}

const Layout: React.FC<IProps> = ({
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
            <Nav direction="hoz" embeddable>
              {renderNav(topNavs)}
            </Nav>
          )}
        </Shell.Action>

        <Shell.Navigation
          // @ts-ignore
          trigger={null}
        >
          <Nav embeddable>{renderNav(sideMenuData)}</Nav>
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

export type ISideMenuData = { text: string; path: string }

export type ITopNavData =
  | {
      text: string
      /**
       * The url.
       * @example 'https://www.google.com/'
       */
      href: string
    }
  | {
      text: string
      /**
       * The path in the current webapp.
       * @example '/posts/hello-world'
       */
      path: string
    }
  | {
      /**
       * The label of the subnav
       */
      subNav: string
      children: ITopNavData[]
    }
  | {
      /**
       * The label of the nav group
       */
      group: string
      children: ITopNavData[]
    }

export function renderNav(navs: ITopNavData[]) {
  return navs.map((item, idx) => {
    if ('path' in item) {
      return (
        <Nav.Item key={idx}>
          <Link to={item.path}>{item.text}</Link>
        </Nav.Item>
      )
    }
    if ('href' in item) {
      return (
        <Nav.Item key={idx}>
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
