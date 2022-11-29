import React, { useMemo, useState, useEffect } from 'react'
import { AutoComplete, Input } from 'antd'
import {
  SearchOutlined,
  NumberOutlined,
  ProfileOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { fetchAllPagesOutlines } from 'vite-plugin-react-pages/client'

import { useThemeCtx } from '../..'

import s from './search.module.less'
import type { PageMeta } from '../../analyzeStaticData'

interface Props {}

// TODO: use https://github.com/nextapps-de/flexsearch to do full text search in browser
// flexsearch options to support both en and zh:
// https://github.com/nextapps-de/flexsearch/issues/202#issuecomment-1092409502

const Search: React.FC<React.PropsWithChildren<Props>> = (props) => {
  const { staticData, resolvedLocale, pageGroups } = useThemeCtx()
  const [popupOpen, setPopupOpen] = useState(false)
  const [keywords, setKeywords] = useState('')
  const navigate = useNavigate()

  const [allPagesOutlines, setAllPagesOutlines] = useState<any>()

  useEffect(() => {
    setTimeout(() => {
      fetchAllPagesOutlines().then((res) => {
        setAllPagesOutlines(res)
      })
    }, 2000)
  }, [])

  // const themeCtxValue = useThemeCtx()
  // console.log('@@themeCtxValue', themeCtxValue)
  // console.log('@@pageGroups', pageGroups)

  const preparedPages = useMemo(() => {
    const res = [] as PageMetaExtended[]
    Object.entries(pageGroups).forEach(([groupKey, group]) => {
      Object.entries(group).forEach(([subGroupKey, pages]) => {
        pages.forEach((page) => {
          // pages with path params should not be showed in search result
          if (page.pagePath.includes('/:')) return
          // pages with different locale should not be showed in search result
          if (resolvedLocale.localeKey !== page.pageLocaleKey) return

          const outlines = (() => {
            const pageOutlines = allPagesOutlines?.[page.pagePath]
            if (!pageOutlines) return
            const outlinesMerged: any[] = []
            Object.entries(pageOutlines).forEach(([key, { outline }]: any) => {
              outlinesMerged.push(...outline)
            })
            if (!outlinesMerged.length) return
            return outlinesMerged
          })()

          res.push({ ...page, outlines })
        })
      })
    })
    return res
  }, [allPagesOutlines, staticData, resolvedLocale.localeKey])

  const options = useMemo(() => {
    const filteredData = filter(preparedPages, keywords)
    return filteredData.map((item) => {
      const { type, page, matechedString } = item
      const rendered = (() => {
        const pagePosition = [page.groupKey, page.subGroupKey, page.pageTitle]
          .filter((s) => s !== '/')
          .join(' > ')
        if (type === 'title') {
          return (
            <div className={s.searchResultLable}>
              <div className={s.searchResultLableIcon}>
                <NumberOutlined
                  style={{ fontSize: '36px', color: '#1f1f1f' }}
                />
              </div>
              <div>
                <div className={s.searchResultMatchedText}>
                  Title: {matechedString}
                </div>
                <div className={s.searchResultPagePosition}>{pagePosition}</div>
              </div>
            </div>
          )
        }
        if (type === 'heading') {
          return (
            <div className={s.searchResultLable}>
              <div className={s.searchResultLableIcon}>
                <ProfileOutlined
                  style={{ fontSize: '36px', color: '#1f1f1f' }}
                />
              </div>
              <div>
                <div className={s.searchResultMatchedText}>
                  Heading: {matechedString}
                </div>
                <div className={s.searchResultPagePosition}>{pagePosition}</div>
              </div>
            </div>
          )
        }
        throw new Error('unexpected SearchResultItem: type ' + type)
      })()
      return {
        value: [
          type,
          page.pagePath,
          type === 'heading' ? item.headingId : '',
          matechedString,
        ].join(' - '),
        label: rendered,
        result: item,
      }
    })
  }, [preparedPages, keywords])

  return (
    <div className={s['search-box']}>
      <AutoComplete
        popupClassName={s.popup}
        dropdownMatchSelectWidth={false}
        style={{ width: 200 }}
        options={options}
        open={popupOpen}
        onDropdownVisibleChange={setPopupOpen}
        value={keywords}
        onSearch={setKeywords}
        onSelect={(value: any, option: any) => {
          const result: SearchResultItem = option.result
          if (result.type === 'title') {
            navigate(result.page.pagePath)
          } else if (result.type === 'heading') {
            navigate(result.page.pagePath + '#' + result.headingId)
          }
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

function filter(
  pages: PageMetaExtended[],
  keywords: string
): SearchResultItem[] {
  keywords = keywords?.trim()
  if (!keywords) return []

  const results: SearchResultItem[] = []

  pages.forEach((page) => {
    if (page.pagePath === '/404') return
    if (containString(page.pageTitle, keywords)) {
      results.push({
        type: 'title',
        page,
        matechedString: page.pageTitle,
      })
    }
    page.outlines?.forEach(({ id, text, depth }, index) => {
      if (text === page.pageTitle && index === 0) {
        // ignore the first outline heading if it is same with the page title
        // we already have a result item with `{type: 'title', matechedString: page.pageTitle}`
        return
      }
      if (containString(text, keywords)) {
        results.push({
          type: 'heading',
          page,
          matechedString: text,
          headingId: id,
        })
      }
    })
  })

  return results
}

/**
 * string match ignoring case
 */
function containString(whole: string, part: string) {
  return whole.toLowerCase().indexOf(part.toLowerCase()) !== -1
}

interface OutlineItem {
  text: string
  id: string
  depth: number
}

type PageMetaExtended = PageMeta & { outlines?: OutlineItem[] }

type SearchResultItem =
  | {
      type: 'title'
      page: PageMetaExtended
      matechedString: string
    }
  | {
      type: 'heading'
      page: PageMetaExtended
      matechedString: string
      headingId: string
    }
