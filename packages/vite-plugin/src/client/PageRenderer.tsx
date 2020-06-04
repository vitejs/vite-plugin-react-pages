import React from 'react'
import invariant from 'tiny-invariant'
import { useLocation } from 'react-router-dom'
import useLoadPage from './useLoadPage'

interface IProps {}

const PageRenderer: React.FC<IProps> = () => {
  const pagePath = usePagePath()
  const { PageComp, pageConfig } = useLoadPage(pagePath)
  if (!PageComp || !pageConfig) return <div>Loading...</div>
  const { configs } = pageConfig
  const { LayoutComponent, ...mergedConfig } = mergeConfigs(configs)
  if (!LayoutComponent) {
    throw new Error(`Page "${pagePath}" don't have config.LayoutComponent`)
  }
  return (
    <LayoutComponent {...mergedConfig}>
      <PageComp />
    </LayoutComponent>
  )
}

export default PageRenderer

export function usePagePath() {
  const { pathname } = useLocation()
  invariant(pathname.startsWith('/workspace/'))
  const pagePath = pathname.replace(/^\/workspace\//, '')
  invariant(pagePath)
  return pagePath
}

function mergeConfigs(configs: object[]): any {
  // 左边的config是距离Page组件最近的
  return configs.reduceRight((merged, cur) => {
    return {
      ...merged,
      ...cur,
    }
  }, {})
}
