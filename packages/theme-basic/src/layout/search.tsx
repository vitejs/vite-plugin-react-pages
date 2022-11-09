import React, { useCallback, useState, useEffect } from 'react'
import { Search, Select } from '@alifd/next'
import s from './style.module.css'
import type { PagesStaticData } from 'vite-plugin-react-pages'
import { useNavigate } from 'react-router-dom'

interface Props {
  readonly pagesStaticData: PagesStaticData
}

interface FilteredData {
  readonly label: string
  readonly path: string
}

const SiteSearch = ({ pagesStaticData }: Props) => {
  const [searchVal, setSearchVal] = useState('')

  const [filteredData, setFilteredData] = useState<ReadonlyArray<FilteredData>>(
    []
  )
  const navigate = useNavigate()

  useEffect(() => {
    setFilteredData(search(pagesStaticData, ''))
  }, [pagesStaticData])

  const onChange = useCallback(
    (value: any, type: any) => {
      if (type === 'itemClick' || type === 'enter') {
        // user confirm search result
        navigate(value)
      } else if (type === 'change') {
        // user input search text
        setFilteredData(search(pagesStaticData, value))
        setSearchVal(value)
      }
    },
    [pagesStaticData]
  )

  return (
    <Search
      shape="simple"
      placeholder="Search"
      filterLocal={false}
      className={s.search}
      value={searchVal}
      onChange={onChange}
    >
      {filteredData.map(({ label, path }) => (
        <Select.Option value={path} key={path}>
          {label}
        </Select.Option>
      ))}
    </Search>
  )
}

export default SiteSearch

function containString(whole: string, part: string) {
  return whole.toLowerCase().indexOf(part.toLowerCase()) !== -1
}

function search(
  pagesStaticData: PagesStaticData,
  value: string
): FilteredData[] {
  return Object.entries(pagesStaticData)
    .map(([path, staticData]) => {
      if (path === '/404') return null
      const label = staticData.title ?? staticData.main.title ?? path
      if (containString(label, value?.trim() ?? '')) {
        return { label, path }
      }
      return null
    })
    .filter(Boolean) as FilteredData[]
}
