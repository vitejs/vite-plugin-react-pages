import React, { useContext, useMemo } from 'react'
import { Layout, ConfigProvider, Row, Col } from 'antd'
import { useStaticData } from 'vite-plugin-react-pages/client'
import 'github-markdown-css/github-markdown.css'

const { Content } = Layout

import s from './index.module.less'
import AppHeader from './Header'
import AppSider, { defaultSideNavs } from './Sider'
import { themeConfigCtx, themePropsCtx } from '../ctx'
export { default as MDX } from './MDX'
import type { SideNavsContext } from '..'

ConfigProvider.config({
  prefixCls: 'vp-antd',
})

interface Props {}

const AppLayout: React.FC<Props> = ({ children }) => {
  const { sideNavs } = useContext(themeConfigCtx)
  const themeProps = useContext(themePropsCtx)
  const staticData = useStaticData()

  const sideNavsData = useMemo(() => {
    const themeContext: SideNavsContext = { ...themeProps, staticData }
    if (typeof sideNavs === 'function') {
      return sideNavs(themeContext)
    }
    if (Array.isArray(sideNavs)) return sideNavs
    return defaultSideNavs(themeContext)
  }, [themeProps])

  return (
    <ConfigProvider prefixCls="vp-antd">
      <div className={s.layout}>
        <AppHeader />
        <Row
          className={[s.body, sideNavsData && s.hasSideNav]
            .filter(Boolean)
            .join(' ')}
        >
          {sideNavsData && (
            <Col xxl={4} xl={5} lg={6} md={6}>
              <AppSider sideNavsData={sideNavsData} />
            </Col>
          )}
          <Col flex="auto" style={{ minWidth: 0 }}>
            <Content className={s.content}>{children}</Content>
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  )
}

export default AppLayout
