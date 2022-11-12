import React, { useMemo, useState } from 'react'
import { AutoComplete, Input } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

import { useThemeCtx } from '../..'

import s from './search.module.less'
import type { PageMeta } from '../../analyzeStaticData'

interface Props {}

const Search: React.FC<React.PropsWithChildren<Props>> = (props) => {
  const { staticData, resolvedLocale, pageGroups } = useThemeCtx()
  const [popupOpen, setPopupOpen] = useState(false)
  const [keywords, setKeywords] = useState('')
  const navigate = useNavigate()

  // const themeCtxValue = useThemeCtx()
  // console.log('@@themeCtxValue', themeCtxValue)
  // console.log('@@pageGroups', pageGroups)

  const preparedPages = useMemo(() => {
    const res = [] as PageMeta[]
    Object.entries(pageGroups).forEach(([groupKey, group]) => {
      Object.entries(group).forEach(([subGroupKey, pages]) => {
        pages.forEach((page) => {
          // pages with path params should not be showed in search result
          if (page.pagePath.includes('/:')) return
          // pages with different locale should not be showed in search result
          if (resolvedLocale.localeKey !== page.pageLocaleKey) return
          res.push(page)
        })
      })
    })
    return res
  }, [staticData, resolvedLocale.localeKey])

  const options = useMemo(() => {
    const filteredData = filter(preparedPages, keywords)
    return filteredData.map(
      ({ groupKey, subGroupKey, pageTitle, pagePath }) => {
        const label = [groupKey, subGroupKey, pageTitle]
          .filter((s) => s !== '/')
          .join(' > ')
        return {
          value: pagePath,
          label,
        }
      }
    )
  }, [preparedPages, keywords])

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
          navigate(value)
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

function filter(pages: PageMeta[], keywords: string): PageMeta[] {
  return pages.filter((page) => {
    if (page.pagePath === '/404') return false
    if (containString(page.pageTitle, keywords?.trim() ?? '')) return true
    return false
  })
}

function containString(whole: string, part: string) {
  return whole.toLowerCase().indexOf(part.toLowerCase()) !== -1
}
