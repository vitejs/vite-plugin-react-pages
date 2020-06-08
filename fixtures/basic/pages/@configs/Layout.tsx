import React from 'react'
import Topbar from './top-bar'
import SideMenu from './side-menu'

const Layout: React.FC<{ Content: React.ComponentType }> = ({ Content }) => {
  return (
    <div>
      <Topbar />
      <div>
        <SideMenu />
        <div>
          <Content />
        </div>
      </div>
    </div>
  )
}

export default Layout
