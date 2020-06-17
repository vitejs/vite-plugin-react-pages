import React from 'react'
import Topbar from './top-bar'
import type { ITopNavData } from './top-bar'
import SideMenu from './side-menu'
import type { ISideMenuData } from './side-menu'
import s from './style.module.css'

import './global.css'

interface IProps {
  sideMenuData: ISideMenuData[]
  topNavs: ITopNavData[]
  logo: React.ReactNode
  path?: string
}

const Layout: React.FC<IProps> = ({
  sideMenuData,
  topNavs,
  logo,
  path,
  children,
}) => {
  return (
    <div className={s.layout}>
      <Topbar topNavs={topNavs} logo={logo} />
      <div className={s.body}>
        <SideMenu data={sideMenuData} />
        <div className={s.content} key={path}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout
