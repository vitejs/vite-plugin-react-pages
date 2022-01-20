import React, { useContext, useMemo, useState } from 'react'
import { ConfigProvider, Grid } from 'antd'
import { useStaticData } from 'vite-plugin-react-pages/client'
import 'github-markdown-css/github-markdown.css'

const { useBreakpoint } = Grid

import s from './index.module.less'
import AppHeader from './Header'
import AppSider, { defaultSideNavs } from './Sider'
import { themeConfigCtx, themePropsCtx } from '../ctx'
export { default as MDX } from './MDX'
import type { SideNavsContext } from '..'
import { LayoutContext } from './ctx'

ConfigProvider.config({
  prefixCls: 'vp-antd',
})

interface Props {}

const AppLayout: React.FC<Props> = ({ children }) => {
  const { sideNavs } = useContext(themeConfigCtx)
  const themeProps = useContext(themePropsCtx)
  const staticData = useStaticData()

  const [isSlideSiderOpen, setIsSlideSiderOpen] = useState(false)

  const sideNavsData = useMemo(() => {
    const themeContext: SideNavsContext = { ...themeProps, staticData }
    if (typeof sideNavs === 'function') {
      return sideNavs(themeContext)
    }
    if (Array.isArray(sideNavs)) return sideNavs
    return defaultSideNavs(themeContext)
  }, [themeProps])

  const screenWidth = useBreakpoint()

  const layoutCtxVal = useMemo(() => {
    return {
      screenWidth,
      isSlideSiderOpen,
      setIsSlideSiderOpen,
    }
  }, [isSlideSiderOpen, screenWidth])

  return (
    <ConfigProvider prefixCls="vp-antd">
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
          </div>
        </div>
      </LayoutContext.Provider>
    </ConfigProvider>
  )
}

export default AppLayout
