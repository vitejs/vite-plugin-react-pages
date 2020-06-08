import React from 'react'
import { Link } from 'react-router-dom'
import defaultData from './data'

interface IProps {
  data?: ISideMenuData[]
}

const SideMenu: React.FC<IProps> = ({data = defaultData}) => {
  return (
    <ul>
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
