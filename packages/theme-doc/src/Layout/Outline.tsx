import React, { useMemo, useContext, useEffect, useState } from 'react'
import { Anchor } from 'antd'
import type { AnchorProps } from 'antd'

import { useThemeCtx } from '..'
import s from './index.module.less'
import { Anchor_Scroll_Offset, isSSR } from '../utils'
import { LayoutContext } from './ctx'

interface Props {}

const OutLine: React.FC<Props> = (props) => {
  const { loadedData, loadState } = useThemeCtx()
  const pageData = loadedData[loadState.routePath]
  const [outline, setOutline] = useState<OutlineItem[] | undefined>(
    () => pageData?.outlineInfo?.outline
  )

  if (import.meta.hot) {
    // subscribe to outline info hmr update
    useEffect(() => {
      const cur = pageData?.outlineInfo?.outline
      setOutline(cur)
      const unsub = pageData?.outlineInfo?.onUpdate?.((newMod: any) => {
        const cur = newMod?.outline
        setOutline(cur)
      })
      return () => {
        unsub?.()
      }
    }, [pageData])
  }

  const data = useMemo(() => {
    // should not render OutLine if there is only one heading
    if (!Array.isArray(outline) || outline.length < 2) return null
    return buildTree(outline)
  }, [outline])

  const layoutCtxVal = useContext(LayoutContext)
  const isSmallScreen = !layoutCtxVal.screenWidth?.md

  if (!data) return null
  if (isSSR || isSmallScreen) {
    // keep width place holder
    // don't render Anchor during ssr because it is not supported well
    return <div className={s.outline}></div>
  }

  const onClickAnchor: AnchorProps['onClick'] = (e, { title, href }) => {
    // preventDefault to prevent browser scroll to the heading
    // let antd Anchor handle the scrolling
    e.preventDefault()
    if (__HASH_ROUTER__) {
      history.pushState(null, '', `#${loadState.routePath}${href}`)
    } else {
      history.pushState(null, '', href)
    }
  }

  return (
    <div className={s.outline}>
      <Anchor
        affix={false}
        className={s.anchors}
        targetOffset={Anchor_Scroll_Offset}
        onClick={onClickAnchor}
        items={renderAnchorLinks(data)}
      />
    </div>
  )
}

function renderAnchorLinks(data: OutlineTreeItem[]): AnchorProps['items'] {
  return data.map(({ id, text, children }) => {
    return {
      key: id,
      href: `#${id}`,
      title: text || id,
      children: renderAnchorLinks(children),
    }
  })
}

export default OutLine

declare global {
  const __HASH_ROUTER__: boolean
}

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
        // recursive
        put(lastBuilt.children)
      } else if (built === rootResult) {
        // nextData.depth < lastBuilt.depth
        // but this is already the outest recursive level
        built.push({ ...nextData, children: [] })
        nextDataIndex++
      } else {
        // nextData.depth < lastBuilt.depth
        // should return to the outer recursive level
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
