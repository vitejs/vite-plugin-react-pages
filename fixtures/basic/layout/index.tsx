import React from 'react'
import Topbar from './top-bar'
import type { ITopNavData } from './top-bar'
import SideMenu from './side-menu'
import type { ISideMenuData } from './side-menu'
import s from "./style.module.css";

import './global.css'

interface IProps {
  Content: React.ComponentType
  sideMenuData?: ISideMenuData[]
  pages: any
}

const Layout: React.FC<IProps> = ({ Content, sideMenuData, pages }) => {
  return (
    <div className={s.layout}>
      <Topbar/>
      <div className={s.body}>
        <SideMenu pages={pages} data={sideMenuData} />
        <div>
          <Content />
        </div>
      </div>
    </div>
  )
}

export default Layout
