import React, { useContext } from 'react'
import { Layout, ConfigProvider, Row, Col } from 'antd'

const { Content } = Layout

import s from './index.module.less'
import AppHeader from './Header'
import AppSider from './Sider'
import { themePropsCtx } from '../ctx'

ConfigProvider.config({
  prefixCls: 'vp-antd',
})

interface Props {}

const AppLayout: React.FC<Props> = (props) => {
  const { loadState, loadedData } = useContext(themePropsCtx)
  const Main = loadedData[loadState.routePath]?.main?.default
  return (
    <ConfigProvider prefixCls="vp-antd">
      <div className={s.layout}>
        <AppHeader />
        <Row className={s.body}>
          <Col xxl={4} xl={5} lg={6} md={6}>
            <AppSider />
          </Col>
          <Col flex="auto" style={{ minWidth: 0 }}>
            <Content className={s.content}>{Main && <Main />}</Content>
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  )
}

export default AppLayout
