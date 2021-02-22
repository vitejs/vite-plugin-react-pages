import React, { useContext, useMemo } from 'react'
import type { PagesStaticData, PagesInternal, Theme } from './types'
import { dataCacheCtx } from './ssr/ctx'
import useAppState from './useAppState'

interface Props {
  readonly Theme: Theme
  readonly pages: PagesInternal
  readonly routePath: string
}

const PageLoader = ({ pages, routePath: routePathFromProps, Theme }: Props) => {
  const dataCache = useContext(dataCacheCtx)
  const loadState = useAppState(pages, routePathFromProps)

  const pagesStaticData = useMemo(() => getPublicPages(pages), [pages])

  return (
    <Theme
      loadState={loadState}
      loadedData={dataCache}
      staticData={pagesStaticData}
    />
  )
}

export default PageLoader

// filter out internal fields inside pages
function getPublicPages(pages: PagesInternal): PagesStaticData {
  return Object.fromEntries(
    Object.entries(pages).map(([path, { staticData }]) => [path, staticData])
  )
}
