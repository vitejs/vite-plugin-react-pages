import React from 'react'
import { Link } from 'react-router-dom'

import s from './style.module.css'

interface IProps {
  topNavs?: ITopNavData[]
  logo?: React.ReactNode
}

const TopBar: React.FC<IProps> = ({ topNavs, logo }) => {
  return (
    <div className={s.topBar}>
      <div className={s.logo}>{logo}</div>
      <div className={s.navs}>
        <ul className={s.navsList}>
          {topNavs?.map((item, index) => {
            let content: React.ReactElement
            if ('href' in item) {
              content = (
                <a href={item.href} target="_blank" className={s.navsListItem}>
                  {item.text}
                </a>
              )
            } else {
              content = (
                <Link to={item.path} className={s.navsListItem}>
                  {item.text}
                </Link>
              )
            }
            return <li key={index}>{content}</li>
          })}
        </ul>
      </div>
    </div>
  )
}

export default TopBar

export type ITopNavData =
  | {
      text: string
      href: string
    }
  | {
      text: string
      path: string
    }
