import React, { useContext, useMemo } from 'react'
import _RcFooter from 'rc-footer'

let RcFooter: any = _RcFooter
// rc-footer is not esm friendly.
// when imported direct by node esm
// it's defailt export is {default: FooterComponent}
if (RcFooter.default) {
  RcFooter = RcFooter.default
}

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
  /**
   * link target would be `_blank` if `openExternal` is ture
   * @default true
   */
  openExternal?: boolean
  /**
   * icon that before link label
   */
  icon?: React.ReactNode
  /**
   * description of column, come after title
   */
  description?: React.ReactNode
}

export type FooterColumn = {
  /**
   * Label of the section of these links.
   */
  title?: React.ReactNode
  /**
   * icon that before column title
   */
  icon?: React.ReactNode
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
  /**
   * Footer theme preset
   * @default 'light'
   */
  theme?: 'light' | 'dark'
}

/**
 * adapter for FooterLink that
 * replace `label` field with
 * `title` to adapt RcFooter' props
 */
const replaceLabelWithTitle = (columns: FooterColumn[]) => {
  return columns.map((col) => ({
    title: col.title,
    icon: col.icon,
    items: col.items?.map((i) => ({
      title: i.label,
      url: i.url,
      openExternal: i.openExternal === false ? false : true,
      icon: i.icon,
      description: i.description,
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

  const {
    message,
    copyright,
    columns = [],
    theme = 'light',
  } = resolvedFooterConfig

  const themeCls = theme === 'dark' ? s['theme-dark'] : s['theme-light']

  return (
    <RcFooter
      theme={theme}
      bottom={
        <>
          {message ? <div>{message}</div> : null}
          {copyright ? <div>{copyright}</div> : null}
        </>
      }
      columns={replaceLabelWithTitle(columns)}
      columnLayout="space-around"
      className={`${s.footer} ${themeCls}`}
      prefixCls={s.footer}
    />
  )
}
