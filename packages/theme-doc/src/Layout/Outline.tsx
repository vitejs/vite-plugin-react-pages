import React, { useMemo, useContext } from 'react'
import { Anchor } from 'antd'
import { useThemeCtx } from '..'
import s from './index.module.less'
import { Anchor_Scroll_Offset } from '../utils'
import { LayoutContext } from './ctx'

interface Props {}

const OutLine: React.FC<Props> = (props) => {
  const { loadedData, loadState } = useThemeCtx()
  const pageData = loadedData[loadState.routePath]

  const data = useMemo(() => {
    const outline: OutlineItem[] | undefined = pageData?.outlineInfo?.outline
    if (!Array.isArray(outline)) return null
    return buildTree(outline)
  }, [pageData])

  const layoutCtxVal = useContext(LayoutContext)
  const isSmallScreen = !layoutCtxVal.screenWidth?.md

  if (!data || isSmallScreen) return null

  return (
    <div className={s.outline}>
      <Anchor affix={true} offsetTop={100} targetOffset={Anchor_Scroll_Offset}>
        {renderAnchorLinks(data)}
      </Anchor>
    </div>
  )
}

function renderAnchorLinks(data: OutlineTreeItem[]) {
  return data.map(({ id, text, children }) => {
    return (
      <Anchor.Link key={id} href={`#${id}`} title={text || id}>
        {renderAnchorLinks(children)}
      </Anchor.Link>
    )
  })
}

export default OutLine

function buildTree(data: OutlineItem[]) {
  let nextDataIndex = 0
  const rootResult: OutlineTreeItem[] = []

  // ensure all items in data is put in rootResult
  while (nextDataIndex < data.length) {
    put(rootResult)
  }

  return rootResult

  function put(built: OutlineTreeItem[]) {
    while (true) {
      const nextData = data[nextDataIndex]
      if (!nextData) return
      const lastBuilt = built[built.length - 1]
      if (!lastBuilt || nextData.depth === lastBuilt.depth) {
        built.push({ ...nextData, children: [] })
        nextDataIndex++
      } else if (nextData.depth > lastBuilt.depth) {
        lastBuilt.children.push({ ...nextData, children: [] })
        nextDataIndex++
        put(lastBuilt.children)
      } else {
        return
      }
    }
  }
}

interface OutlineItem {
  id: string
  depth: string
  text: string
}

type OutlineTreeItem = OutlineItem & { children: OutlineTreeItem[] }
