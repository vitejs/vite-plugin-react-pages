import React from 'react'
import { Dropdown, Button } from 'antd'
import type { MenuProps } from 'antd'
import { CaretDownFilled } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

import { useThemeCtx } from '..'
import { removeTrailingSlash } from '../utils'

export function useLocaleSelector() {
  const themeCtxValue = useThemeCtx()
  const navigate = useNavigate()

  return { render }

  function render() {
    const {
      staticData,
      themeConfig: { i18n: { locales, topBarLocaleSelector = true } = {} },
      resolvedLocale: { locale, localeKey, pagePathWithoutLocalePrefix },
    } = themeCtxValue

    if (!locales || Object.keys(locales).length < 2 || !topBarLocaleSelector)
      return null

    const localeOptions = Object.entries(locales).map(([key, locale]) => {
      return {
        key,
        label: locale.label || key,
      }
    })

    const menu: MenuProps = {
      selectable: true,
      selectedKeys: localeKey ? [localeKey] : undefined,
      items: localeOptions,
      onSelect: (info) => {
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
          // infer the page path with selected locale
          let newRoutePath =
            removeTrailingSlash(newLocale.routePrefix) +
            pagePathWithoutLocalePrefix
          if (!staticData[newRoutePath]) {
            // fallback to the index page of this locale
            newRoutePath = newLocale.routePrefix
          }
          if (staticData[newRoutePath]) {
            navigate(newRoutePath)
          }
        }
      },
    }

    return (
      <Dropdown menu={menu}>
        <Button size="small" style={{ verticalAlign: 'middle' }}>
          {locale?.label || localeKey || 'Select locale'}
          <CaretDownFilled size={12} />
        </Button>
      </Dropdown>
    )
  }
}
