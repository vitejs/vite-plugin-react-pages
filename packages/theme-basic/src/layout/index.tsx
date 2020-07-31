import React from 'react'
import { Link } from 'react-router-dom'
import { Nav, Shell, ConfigProvider } from '@alifd/next'
import 'github-markdown-css/github-markdown.css'
import type { IPages } from 'vite-plugin-react-pages'

import s from './style.module.css'
import MDX from './MDX'
import './global.css'
// import SiteSearch from './search'

interface IProps {
  sideMenuData: ISideMenuData[]
  topNavs: ITopNavData[]
  logo: React.ReactNode
  applyMdStyle?: boolean
  path?: string
  footer?: React.ReactNode
  pages: IPages
}

const Layout: React.FC<IProps> = ({
  sideMenuData,
  topNavs,
  logo,
  applyMdStyle,
  path,
  children,
  footer,
  pages,
}) => {
  return (
    <ConfigProvider prefix="vp-theme-">
      <Shell className={s.layout}>
        <Shell.Branding>{logo} </Shell.Branding>
        {/* <Shell.Navigation direction="hoz">
        <SiteSearch pages={pages} />
      </Shell.Navigation> */}
        <Shell.Action>
          <Nav direction="hoz" embeddable>
            {renderNav(topNavs)}
          </Nav>
        </Shell.Action>

        <Shell.Navigation
          // @ts-ignore
          trigger={null}
        >
          <Nav embeddable>{renderNav(sideMenuData)}</Nav>
        </Shell.Navigation>

        <Shell.Content className={s.content}>
          <div className={applyMdStyle ? ` markdown-body` : ''} key={path}>
            {applyMdStyle ? <MDX>{children}</MDX> : children}
          </div>
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
      href: string
    }
  | {
      text: string
      path: string
    }
  | {
      subNav: string
      children: ITopNavData[]
    }
  | {
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
