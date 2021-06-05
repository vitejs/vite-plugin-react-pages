import React, { useContext } from 'react'
import { Layout, Menu, Row, Col } from 'antd'
import { useLocation, Link } from 'react-router-dom'
import { useStaticData } from 'vite-plugin-react-pages/client'

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
  const indexPagestaticData = useStaticData('/')

  const logoLink = (() => {
    if (themeConfig.logoLink !== undefined) return themeConfig.logoLink
    if (indexPagestaticData) {
      return '/'
    }
  })()

  const renderLogo = (() => {
    if (logoLink) {
      return (
        <Link to={logoLink} className={s.logoLink}>
          {themeConfig.logo}
        </Link>
      )
    }
    return themeConfig.logo
  })()

  return (
    <Header className={s.header}>
      <Row align="stretch" style={{ height: '100%' }}>
        <Col flex="0 0 auto">
          <Row justify="center" align="middle" style={{ height: '100%' }}>
            <Col>{renderLogo}</Col>
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
