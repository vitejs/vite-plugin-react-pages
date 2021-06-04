import React, { useContext, useMemo } from 'react'
import { Layout, ConfigProvider, Row, Col } from 'antd'
import { useStaticData } from 'vite-plugin-react-pages/client'
import 'github-markdown-css/github-markdown.css'

const { Content } = Layout

import s from './index.module.less'
import AppHeader from './Header'
import AppSider, { defaultSideNav } from './Sider'
import { themeConfigCtx, themePropsCtx } from '../ctx'
import MDX from './MDX'

ConfigProvider.config({
  prefixCls: 'vp-antd',
})

interface Props {}

const AppLayout: React.FC<Props> = () => {
  const { sideNavs } = useContext(themeConfigCtx)
  const themeProps = useContext(themePropsCtx)
  const { loadState, loadedData } = themeProps
  const Main = loadedData[loadState.routePath]?.main?.default
  const staticData = useStaticData()
  const isMarkdown =
    staticData?.[loadState.routePath]?.main?.sourceType === 'md'

  const sideNavsData = useMemo(() => {
    const themeContext = { ...themeProps, staticData }
    if (typeof sideNavs === 'function') {
      return sideNavs(themeContext)
    }
    if (Array.isArray(sideNavs)) return sideNavs
    return defaultSideNav(themeContext)
  }, [themeProps])

  const mainContent = Main && <Main />

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
            <Content className={s.content}>
              {isMarkdown ? <MDX>{mainContent}</MDX> : mainContent}
            </Content>
          </Col>
        </Row>
      </div>
    </ConfigProvider>
  )
}

export default AppLayout
