import React, { useContext } from 'react'
import { dataCacheCtx } from './ssr/ctx'
import { useTheme, useStaticData } from './state'
import useAppState from './useAppState'

interface Props {
  routePath: string
}

const PageLoader = React.memo(({ routePath }: Props) => {
  const Theme = useTheme()
  const loadState = useAppState(routePath)
  const dataCache = useContext(dataCacheCtx)

  return (
    <Theme
      loadState={loadState}
      loadedData={dataCache}
      useStaticData={useStaticData}
    />
  )
})

export default PageLoader
