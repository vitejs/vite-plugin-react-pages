import React from 'react'
import { Link } from 'react-router-dom'
import s from './style.module.css'

interface IProps {
  data?: ISideMenuData[]
  pages: any
}

const SideMenu: React.FC<IProps> = ({ data, pages }) => {
  // by default, generate side menu from pages metadata 
  // user can overwrite SideMenu data for some pages
  return (
    <ul className={s.sideMenu}>
      {data
        ? data.map((item, index) => {
            return (
              <li key={index}>
                <Link to={item.path}>{item.text}</Link>
              </li>
            )
          })
        : defaultMenu(pages)}
    </ul>
  )
}

function defaultMenu(pages: any) {
  return Object.entries<any>(pages)
    .sort((a, b) => {
      return a[0].localeCompare(b[0])
    })
    .map(([path, { staticData }]) => {
      if (staticData.title) {
        return (
          <li key={path}>
            <Link to={path}>{staticData.title}</Link>
          </li>
        )
      }
      return null
    })
}

export default SideMenu

export type ISideMenuData = { text: string; path: string }
