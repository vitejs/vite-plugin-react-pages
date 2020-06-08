import React from 'react'
import Topbar from './top-bar'
import type { ITopNavData } from './top-bar'
import SideMenu from './side-menu'
import type { ISideMenuData } from './side-menu'

interface IProps {
  Content: React.ComponentType
  sideMenuData?: ISideMenuData[]
  topNavData?: ITopNavData[]
}

const Layout: React.FC<IProps> = ({ Content, sideMenuData, topNavData }) => {
  return (
    <div>
      <Topbar data={topNavData} />
      <div>
        <SideMenu data={sideMenuData} />
        <div>
          <Content />
        </div>
      </div>
    </div>
  )
}

export default Layout
