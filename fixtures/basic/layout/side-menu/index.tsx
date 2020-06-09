import React from 'react'
import { Link } from 'react-router-dom'
import defaultData from './data'
import s from "./style.module.css";

interface IProps {
  data?: ISideMenuData[]
}

const SideMenu: React.FC<IProps> = ({data = defaultData}) => {
  return (
    <ul className={s.sideMenu}>
      {data.map((item, index) => {
        return (
          <li key={index}>
            <Link to={item.path}>{item.text}</Link>
          </li>
        )
      })}
    </ul>
  )
}

export default SideMenu

export type ISideMenuData = { text: string; path: string }
