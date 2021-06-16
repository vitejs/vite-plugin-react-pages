import React from 'react'
import { Menu } from 'antd'
import { Link } from 'react-router-dom'
import type { RouteProps } from 'react-router-dom'
import { CaretDownOutlined } from '@ant-design/icons'

const { SubMenu } = Menu

export const renderMenuHelper = (isTopNav: boolean) =>
  function renderMenu(
    menuConfig: ReadonlyArray<MenuConfig>,
    isFirstLevel: boolean = false,
    collectMenuKeys: string[] = []
  ) {
    function getIcon(item: MenuConfig, defaultIcon?: React.ReactNode) {
      const actualIcon = 'icon' in item ? item.icon : defaultIcon
      if (isTopNav) {
        return {
          leftIcon: undefined,
          rightIcon: actualIcon,
        }
      }
      return {
        leftIcon: actualIcon,
        rightIcon: undefined,
      }
    }

    return menuConfig.map((item) => {
      if ('href' in item) {
        const { leftIcon, rightIcon } = getIcon(
          item,
          isFirstLevel && typeof item.label === 'string' ? (
            <ExternalLinkIcon />
          ) : undefined
        )
        return (
          <Menu.Item key={item.href} icon={leftIcon}>
            <a href={item.href} target="_blank" rel="noopener noreferrer">
              {item.label}
              {rightIcon}
            </a>
          </Menu.Item>
        )
      }
      if ('path' in item) {
        const { leftIcon, rightIcon } = getIcon(item)
        return (
          <Menu.Item key={item.path} icon={leftIcon}>
            <Link to={item.path}>
              {item.label}
              {rightIcon}
            </Link>
          </Menu.Item>
        )
      }
      if ('subMenu' in item) {
        const { leftIcon, rightIcon } = getIcon(
          item,
          isTopNav ? <SubMenuIcon /> : undefined
        )
        collectMenuKeys.push(item.subMenu)
        return (
          <SubMenu
            key={item.subMenu}
            title={
              <>
                {item.subMenu}
                {rightIcon}
              </>
            }
            icon={leftIcon}
          >
            {renderMenu(item.children)}
          </SubMenu>
        )
      }
      if ('group' in item) {
        return (
          <Menu.ItemGroup key={item.group} title={item.group}>
            {renderMenu(item.children)}
          </Menu.ItemGroup>
        )
      }
      throw new Error(`invalid menu config`)
    })
  }

export type MenuConfig =
  | {
      readonly label: string
      /**
       * The url.
       * @example 'https://www.google.com/'
       */
      readonly href: string
      readonly icon?: React.ReactNode
    }
  | {
      readonly label: string
      /**
       * The path in the current webapp.
       * @example '/posts/hello-world'
       */
      readonly path: string
      readonly icon?: React.ReactNode
      /**
       * The menu item will show an "active" state
       * if it matches with current browsing path.
       */
      readonly activeIfMatch?: string | string[] | RouteProps
    }
  | {
      /**
       * The label of the subnav
       */
      readonly subMenu: string
      readonly children: ReadonlyArray<MenuConfig>
      readonly icon?: React.ReactNode
      readonly activeIfMatch?: string | string[] | RouteProps
    }
  | {
      /**
       * The label of the nav group
       */
      readonly group: string
      readonly children: ReadonlyArray<MenuConfig>
    }

function ExternalLinkIcon() {
  return (
    <span
      style={{
        position: 'relative',
        top: 2,
        marginLeft: 2,
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        x="0px"
        y="0px"
        viewBox="0 0 100 100"
        width="14"
        height="14"
      >
        <path
          fill="currentColor"
          d="M18.8,85.1h56l0,0c2.2,0,4-1.8,4-4v-32h-8v28h-48v-48h28v-8h-32l0,0c-2.2,0-4,1.8-4,4v56C14.8,83.3,16.6,85.1,18.8,85.1z"
        ></path>
        <polygon
          fill="currentColor"
          points="45.7,48.7 51.3,54.3 77.2,28.5 77.2,37.2 85.2,37.2 85.2,14.9 62.8,14.9 62.8,22.9 71.5,22.9"
        ></polygon>
      </svg>
    </span>
  )
}

function SubMenuIcon() {
  return <CaretDownOutlined style={{ marginLeft: 2, marginRight: 0 }} />
}
