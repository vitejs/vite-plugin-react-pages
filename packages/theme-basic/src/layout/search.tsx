import React, { useCallback, useState, useEffect } from 'react'
import { Search, Select } from '@alifd/next'
import s from './style.module.css'
import type { IPagesStaticData } from 'vite-plugin-react-pages'
import { useHistory } from 'react-router-dom'

interface IProps {
  pagesStaticData: IPagesStaticData
}

interface IFilteredData {
  label: string
  path: string
}

const SiteSearch: React.FC<IProps> = ({ pagesStaticData }) => {
  const [searchVal, setSearchVal] = useState('')

  const [filteredData, setFilteredData] = useState<IFilteredData[]>([])
  const history = useHistory()

  useEffect(() => {
    setFilteredData(search(pagesStaticData, ''))
  }, [])

  const onChange = useCallback((value, type, _) => {
    if (type === 'itemClick' || type === 'enter') {
      // user confirm search result
      history.push(value)
    } else if (type === 'change') {
      // user input search text
      setFilteredData(search(pagesStaticData, value))
      setSearchVal(value)
    }
  }, [])

  return (
    <Search
      shape="simple"
      placeholder="Search"
      filterLocal={false}
      className={s.search}
      value={searchVal}
      // @ts-ignore
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
  pagesStaticData: IPagesStaticData,
  value: string
): IFilteredData[] {
  return Object.entries(pagesStaticData)
    .map(([path, staticData]) => {
      if (path === '/404') return null
      const label = staticData.title ?? staticData.main.title ?? path
      if (containString(label, value?.trim() ?? '')) {
        return { label, path }
      }
      return null
    })
    .filter(Boolean) as IFilteredData[]
}
