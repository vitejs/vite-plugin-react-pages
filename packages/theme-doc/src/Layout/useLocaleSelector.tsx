import React from 'react'
import { Dropdown, Menu, Button } from 'antd'
import { CaretDownFilled } from '@ant-design/icons'
import { useHistory } from 'react-router-dom'

import { useThemeCtx } from '..'
import { ensureStartSlash, removeTrailingSlash } from '../utils'

export function useLocaleSelector() {
  const themeCtxValue = useThemeCtx()
  const history = useHistory()

  return { render }

  function render() {
    const {
      staticData,
      themeConfig: { i18n: { locales } = {} },
      resolvedLocale: { locale, localeKey, pagePathWithoutLocalePrefix },
    } = themeCtxValue

    if (!locales) return null

    const localeOptions = Object.entries(locales).map(([key, locale]) => {
      return {
        key,
        label: locale.label || key,
      }
    })

    const menu = (
      <Menu
        selectable
        selectedKeys={localeKey ? [localeKey] : undefined}
        items={localeOptions}
        onSelect={(info) => {
          if (info.key !== localeKey) {
            // change locale
            const newLocale = locales[info.key]
            if (!newLocale?.routePrefix || !pagePathWithoutLocalePrefix) {
              console.error('unexpected', {
                newLocale,
                pagePathWithoutLocalePrefix,
              })
              return
            }
            let newRoutePath = ensureStartSlash(
              removeTrailingSlash(newLocale.routePrefix) +
                pagePathWithoutLocalePrefix
            )
            if (!staticData[newRoutePath]) {
              newRoutePath = ensureStartSlash(
                removeTrailingSlash(newLocale.routePrefix)
              )
            }
            history.push(newRoutePath)
          }
        }}
      />
    )

    return (
      <Dropdown overlay={menu}>
        <Button size="small" style={{ verticalAlign: 'middle' }}>
          {locale?.label || localeKey || 'Select locale'}
          <CaretDownFilled size={12} />
        </Button>
      </Dropdown>
    )
  }
}
