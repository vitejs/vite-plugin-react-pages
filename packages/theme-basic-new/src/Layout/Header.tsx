import React, { useContext } from 'react'
import { Layout, Menu, Row, Col } from 'antd'
import { useLocation } from 'react-router-dom'

const { Header } = Layout
import s from './index.module.less'
import { themeConfigCtx } from '../ctx'
import { renderMenuHelper } from './renderMenu'

const renderMenu = renderMenuHelper(true)

interface Props {}

const AppHeader: React.FC<Props> = (props) => {
  const themeConfig = useContext(themeConfigCtx)
  const { TopBarExtra, topNavs } = themeConfig
  const location = useLocation()

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
              {topNavs && (
                <Menu
                  className={s.nav}
                  mode="horizontal"
                  selectedKeys={[location.pathname]}
                >
                  {renderMenu(topNavs, true)}
                </Menu>
              )}
            </Col>
            <Col>{TopBarExtra && <TopBarExtra />}</Col>
          </Row>
        </Col>
      </Row>
    </Header>
  )
}

export default AppHeader
