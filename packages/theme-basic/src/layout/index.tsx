import React from 'react'
import Topbar from './top-bar'
import type { ITopNavData } from './top-bar'
import SideMenu from './side-menu'
import type { ISideMenuData } from './side-menu'
import s from './style.module.css'

import './global.css'

interface IProps {
  Content: React.ComponentType
  sideMenuData: ISideMenuData[]
  topNavs: ITopNavData[]
  logo: React.ReactNode
}

const Layout: React.FC<IProps> = ({ Content, sideMenuData, topNavs, logo }) => {
  return (
    <div className={s.layout}>
      <Topbar topNavs={topNavs} logo={logo} />
      <div className={s.body}>
        <SideMenu data={sideMenuData} />
        <div className={s.content}>
          <Content />
        </div>
      </div>
    </div>
  )
}

export default Layout

