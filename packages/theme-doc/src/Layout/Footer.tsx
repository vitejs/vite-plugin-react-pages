import React, { useContext, useMemo } from 'react'
import RcFooter from 'rc-footer'

import { themeConfigCtx, useThemeCtx } from '../ctx'
import s from './Footer.module.less'

export type FooterLink = {
  /**
   * Text to be displayed for this link.
   */
  label: string
  /**
   * navigating to other websites
   */
  url: string
}

export type FooterColumn = {
  /**
   * Label of the section of these links.
   */
  title?: React.ReactNode
  /**
   * Links in this section.
   */
  items?: Array<FooterLink>
}

export type FooterConfig = {
  /**
   * The link groups to be present.
   */
  columns?: Array<FooterColumn>
  /**
   * The message to be displayed at the bottom.
   */
  message?: React.ReactNode
  /**
   * The copyright message to be displayed at the bottom.
   */
  copyright?: React.ReactNode
}

const replaceLabelWithTitle = (columns: FooterColumn[]) => {
  return columns.map((col) => ({
    title: col.title,
    items: col.items?.map((i) => ({
      title: i.label,
      url: i.url,
    })),
  }))
}

export const Footer = () => {
  const themeConfig = useContext(themeConfigCtx)
  const themeCtxValue = useThemeCtx()

  const resolvedFooterConfig = useMemo(() => {
    if (typeof themeConfig.footer === 'function') {
      return themeConfig.footer(themeCtxValue)
    }
    return themeConfig.footer
  }, [themeCtxValue])

  if (!resolvedFooterConfig) {
    return null
  }

  const { message, copyright, columns = [] } = resolvedFooterConfig

  return (
    <RcFooter
      bottom={
        <>
          <div>{message}</div>
          <div>{copyright}</div>
        </>
      }
      columns={replaceLabelWithTitle(columns)}
      columnLayout="space-around"
      className={s.footer}
      prefixCls="vp-local-footer"
    />
  )
}
