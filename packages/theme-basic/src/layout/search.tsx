import React, { useCallback, useState } from 'react'
import { Search } from '@alifd/next'
import s from './style.module.css'
import type { IPages } from 'vite-plugin-react-pages'

interface IProps {
  pages: IPages
}

const SiteSearch: React.FC<IProps> = ({ pages }) => {
  const [result, setResult] = useState([])

  const onSearch = useCallback(() => {
    console.log('onSearch', pages)
  }, [])
  const onChange = useCallback((value, type, _) => {
    console.log('onChange', value, type, _)
    if (type === 'change') {
      Object.entries(pages).map(([path, { staticData }]) => {})
    }
  }, [])

  return (
    <Search
      shape="simple"
      placeholder="Search"
      className={s.search}
      onSearch={onSearch}
      // @ts-ignore
      onChange={onChange}
    />
  )
}

export default SiteSearch
