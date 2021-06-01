import React, { useContext } from 'react'
import { Layout, ConfigProvider, Row, Col } from 'antd'

const { Content } = Layout

import s from './index.module.less'
import AppHeader from './Header'
import AppSider from './Sider'
import { themeConfigCtx, themePropsCtx } from '../ctx'

ConfigProvider.config({
  prefixCls: 'vp-antd',
})

interface Props {}

const AppLayout: React.FC<Props> = (props) => {
  const { sideNavs } = useContext(themeConfigCtx)
  const themeProps = useContext(themePropsCtx)
  const { loadState, loadedData } = themeProps
  const Main = loadedData[loadState.routePath]?.main?.default

  const sideNavsData =
    typeof sideNavs === 'function' ? sideNavs(themeProps) : sideNavs

  return (
    <ConfigProvider prefixCls="vp-antd">
      <div className={s.layout}>
        <AppHeader />
        <Row className={s.body}>
          {sideNavsData && (
            <Col xxl={4} xl={5} lg={6} md={6}>
              <AppSider sideNavsData={sideNavsData} />
            </Col>
          )}
          <Col flex="auto" style={{ minWidth: 0 }}>
            <Content className={s.content}>{Main && <Main />}</Content>
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  )
}

export default AppLayout
