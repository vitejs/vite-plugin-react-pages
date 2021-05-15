import React from 'react'
import { Layout, Menu } from 'antd'

const { SubMenu } = Menu
const { Header } = Layout

import s from './index.module.less'

interface Props {}

const AppHeader: React.FC<Props> = (props) => {
  return (
    <Header className={s.header}>
      <div className={s.logo} />
      <Menu mode="horizontal" defaultSelectedKeys={['2']}>
        <Menu.Item key="1">nav 1</Menu.Item>
        <Menu.Item key="2">nav 2</Menu.Item>
        <Menu.Item key="3">nav 3</Menu.Item>
      </Menu>
    </Header>
  )
}

export default AppHeader
