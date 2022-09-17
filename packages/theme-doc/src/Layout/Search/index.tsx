import React, { useMemo, useState } from 'react'
import type { PagesStaticData } from 'vite-plugin-react-pages'
import { AutoComplete, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

import { useThemeCtx } from '../..'

import s from './search.module.less'

interface Props {}

const Search: React.FC<Props> = (props) => {
  const themeCtxValue = useThemeCtx()
  const [popupOpen, setPopupOpen] = useState(false)
  const [keywords, setKeywords] = useState('')

  console.log('@@themeCtxValue', themeCtxValue)

  const options = useMemo(() => {
    const filteredData = filter(themeCtxValue.staticData, keywords)
    return filteredData.map(({ label, path }) => {
      return { value: path, label }
    })
  }, [themeCtxValue.staticData, keywords])

  return (
    <div className={s['search-box']}>
      <AutoComplete
        popupClassName={s.popup}
        options={options}
        // open
        open={popupOpen}
        placement="topLeft"
        onDropdownVisibleChange={setPopupOpen}
        value={keywords}
        onSearch={setKeywords}
        onSelect={(value: any, option: any) => {
          console.log('@onSelect', value, option)
        }}
      >
        <Input
          placeholder="搜索"
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
