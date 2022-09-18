import React, { useMemo, useState } from 'react'
import type { PagesStaticData } from 'vite-plugin-react-pages'
import { AutoComplete, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useHistory } from 'react-router-dom'

import { useThemeCtx } from '../..'

import s from './search.module.less'
import { matchPagePathLocalePrefix } from '../../analyzeStaticData'

interface Props {}

const Search: React.FC<Props> = (props) => {
  const { staticData, themeConfig, resolvedLocale, pageGroups } = useThemeCtx()
  const [popupOpen, setPopupOpen] = useState(false)
  const [keywords, setKeywords] = useState('')
  const history = useHistory()

  // const themeCtxValue = useThemeCtx()
  // console.log('@@themeCtxValue', themeCtxValue)
  // console.log('@@pageGroups', pageGroups)

  const preparedStaticData: PagesStaticData = useMemo(() => {
    return Object.fromEntries(
      Object.entries(staticData).filter(([pagePath, staticData]) => {
        // pages with path params should not be showed in search result
        if (pagePath.includes('/:')) return false
        const { localeKey } = matchPagePathLocalePrefix(
          pagePath,
          themeConfig.i18n
        )
        // filter out pages with different locale
        if (resolvedLocale.localeKey !== localeKey) return false
        return true
      })
    )
  }, [staticData, themeConfig.i18n, resolvedLocale.localeKey])

  const options = useMemo(() => {
    const filteredData = filter(preparedStaticData, keywords)
    return filteredData.map(({ label, path }) => {
      return { value: path, label }
    })
  }, [preparedStaticData, keywords])

  return (
    <div className={s['search-box']}>
      <AutoComplete
        popupClassName={s.popup}
        options={options}
        open={popupOpen}
        placement="topLeft"
        onDropdownVisibleChange={setPopupOpen}
        value={keywords}
        onSearch={setKeywords}
        onSelect={(value: any, option: any) => {
          history.push(value)
        }}
      >
        <Input
          placeholder="Search"
          prefix={<SearchOutlined className={s.icon} />}
          bordered={false}
          className={s.input}
        />
      </AutoComplete>
    </div>
  )
}

export default Search

interface FilteredData {
  readonly label: string
  readonly path: string
}

function filter(
  pagesStaticData: PagesStaticData,
  keywords: string
): FilteredData[] {
  return Object.entries(pagesStaticData)
    .map(([path, staticData]) => {
      if (path === '/404') return null
      const label = staticData.title ?? staticData.main.title ?? path
      if (containString(label, keywords?.trim() ?? '')) {
        return { label, path }
      }
      return null
    })
    .filter(Boolean) as FilteredData[]
}

function containString(whole: string, part: string) {
  return whole.toLowerCase().indexOf(part.toLowerCase()) !== -1
}
