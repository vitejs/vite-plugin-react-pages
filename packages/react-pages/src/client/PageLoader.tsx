import React, { useContext, useMemo } from 'react'
import type { IPagesStaticData, IPagesInternal, ITheme } from './types'
import { dataCacheCtx } from './ssr/ctx'
import useAppState from './useAppState'

interface IProps {
  Theme: ITheme
  pages: IPagesInternal
  routePath: string
}

const PageLoader: React.FC<IProps> = ({
  pages,
  routePath: routePathFromProps,
  Theme,
}) => {
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
function getPublicPages(pages: IPagesInternal): IPagesStaticData {
  return Object.fromEntries(
    Object.entries(pages).map(([path, { staticData }]) => [
      path,
      staticData,
    ])
  )
}
