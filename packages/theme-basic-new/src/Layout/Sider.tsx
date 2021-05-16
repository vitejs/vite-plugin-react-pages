import React, { useContext } from 'react'
import { Layout, Menu } from 'antd'
import { useLocation } from 'react-router-dom'

import { renderMenuHelper } from './renderMenu'
import { themeConfigCtx, themePropsCtx } from '../ctx'
import s from './index.module.less'

const { Sider } = Layout

interface Props {}

const renderMenu = renderMenuHelper(false)

const AppSider: React.FC<Props> = (props) => {
  const { sideNavs } = useContext(themeConfigCtx)
  const themeProps = useContext(themePropsCtx)
  const location = useLocation()

  const sideNavsData =
    typeof sideNavs === 'function' ? sideNavs(themeProps) : sideNavs

  const subMenuKeys: string[] = []
  const menu = sideNavsData && renderMenu(sideNavsData, true, subMenuKeys)

  return (
    <div className={s.sider}>
      {sideNavsData && (
        <Menu
          className={s.sideMenu}
          // clear menu state when path change
          key={themeProps.loadState.routePath}
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={subMenuKeys}
          inlineIndent={30}
        >
          {menu}
        </Menu>
      )}
    </div>
  )
}

export default AppSider
