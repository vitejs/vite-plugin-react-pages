import React from 'react'
import { Dropdown, Menu, Button } from 'antd'
import { CaretDownFilled } from '@ant-design/icons'
import { useHistory } from 'react-router-dom'

import { useThemeCtx } from '..'

export function useLocaleSelector() {
  const themeCtxValue = useThemeCtx()
  const history = useHistory()

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
            // infer the page path with selected locale
            let newRoutePath =
              newLocale.routePrefix + pagePathWithoutLocalePrefix
            if (!staticData[newRoutePath]) {
              // fallback to the index page of this locale
              newRoutePath = newLocale.routePrefix
            }
            if (staticData[newRoutePath]) {
              history.push(newRoutePath)
            }
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
