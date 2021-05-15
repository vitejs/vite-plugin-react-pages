import React from 'react'
import { Layout, Menu, Row, Col, Button } from 'antd'
import { SettingOutlined } from '@ant-design/icons'

const { SubMenu } = Menu
const { Header } = Layout
import s from './index.module.less'

interface Props {}

const AppHeader: React.FC<Props> = (props) => {
  return (
    <Header className={s.header}>
      <Row align="stretch" style={{ height: '100%' }}>
        <Col flex="200px">
          <Row justify="center" align="middle" style={{ height: '100%' }}>
            <Col>
              <div className={s.logo} />
            </Col>
          </Row>
        </Col>
        <Col flex="auto">
          <Row justify="end">
            <Col>
              <Menu
                className={s.nav}
                mode="horizontal"
                defaultSelectedKeys={['2']}
              >
                <Menu.Item key="1">nav 1</Menu.Item>
                <Menu.Item key="2">nav 2</Menu.Item>
                <SubMenu
                  key="SubMenu"
                  icon={<SettingOutlined />}
                  title="Navigation Three - Submenu"
                >
                  <Menu.ItemGroup title="Item 1">
                    <Menu.Item key="setting:1">Option 1</Menu.Item>
                    <Menu.Item key="setting:2">Option 2</Menu.Item>
                  </Menu.ItemGroup>
                  <Menu.ItemGroup title="Item 2">
                    <Menu.Item key="setting:3">Option 3</Menu.Item>
                    <Menu.Item key="setting:4">Option 4</Menu.Item>
                  </Menu.ItemGroup>
                </SubMenu>
                <Menu.Item key="3">nav 4</Menu.Item>
              </Menu>
            </Col>
            <Col>
              <Button size="small" style={{ verticalAlign: 'middle' }}>
                Custom Action
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </Header>
  )
}

export default AppHeader
