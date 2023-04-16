import React, { useContext, useMemo, useState } from 'react'
import { ConfigProvider, Grid } from 'antd'
// import 'github-markdown-css/github-markdown-light.css'
import './github-markdown-light.css'

const { useBreakpoint } = Grid

import s from './index.module.less'
import AppHeader from './Header'
import AppSider, { defaultSideNavs } from './Sider'
import { themeConfigCtx } from '../ctx'
export { default as MDX } from './MDX'
import { useThemeCtx } from '..'
import { LayoutContext } from './ctx'
import { Footer } from './Footer'
import OutLine from './Outline'

ConfigProvider.config({
  prefixCls: 'vp-antd',
})

interface Props {}

const AppLayout: React.FC<React.PropsWithChildren<Props>> = ({ children }) => {
  const { sideNavs } = useContext(themeConfigCtx)
  const themeCtxValue = useThemeCtx()

  const [isSlideSiderOpen, setIsSlideSiderOpen] = useState(false)

  const sideNavsData = useMemo(() => {
    if (typeof sideNavs === 'function') return sideNavs(themeCtxValue)
    if (Array.isArray(sideNavs)) return sideNavs
    return defaultSideNavs(themeCtxValue)
  }, [themeCtxValue])

  const screenWidth = useBreakpoint()

  const layoutCtxVal = useMemo(() => {
    return {
      screenWidth,
      isSlideSiderOpen,
      setIsSlideSiderOpen,
    }
  }, [isSlideSiderOpen, screenWidth])

  return (
    <ConfigProvider prefixCls="vp-antd" theme={theme}>
      <LayoutContext.Provider value={layoutCtxVal}>
        <div className={s.layout}>
          <AppHeader />
          <div
            className={[s.body, sideNavsData && s.hasSideNav]
              .filter(Boolean)
              .join(' ')}
          >
            {sideNavsData && sideNavsData.length > 0 && (
              <div className={s.siderCtn}>
                <AppSider sideNavsData={sideNavsData} />
              </div>
            )}
            <div className={s.content}>{children}</div>
            <OutLine />
          </div>
          <Footer />
        </div>
      </LayoutContext.Provider>
    </ConfigProvider>
  )
}

export default AppLayout

const theme = {
  token: {
    colorSplit: 'rgba(5, 5, 5, 0.1)',
  },
} as const
