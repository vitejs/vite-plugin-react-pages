import React from 'react'
import type { MenuProps } from 'antd'
import { Link } from 'react-router-dom'
import type { PathPattern } from 'react-router-dom'
import { CaretDownOutlined } from '@ant-design/icons'

type ItemTypes = NonNullable<MenuProps['items']>

export const renderMenuHelper = (isTopNav: boolean) =>
  function renderMenu(
    menuConfig: ReadonlyArray<MenuConfig>,
    isFirstLevel: boolean = false,
    collectMenuKeys: string[] = []
  ): ItemTypes {
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

        return {
          key: item.href,
          icon: leftIcon,
          label: (
            <a href={item.href} target="_blank" rel="noopener noreferrer">
              {item.label}
              {rightIcon}
            </a>
          ),
        }
      }

      if ('path' in item) {
        const { leftIcon, rightIcon } = getIcon(item)

        return {
          key: item.path,
          icon: leftIcon,
          label: (
            <Link to={item.path}>
              {item.label}
              {rightIcon}
            </Link>
          ),
        }
      }

      if ('subMenu' in item) {
        const { leftIcon, rightIcon } = getIcon(
          item,
          isTopNav ? <SubMenuIcon /> : undefined
        )
        collectMenuKeys.push(item.subMenu)

        return {
          key: item.subMenu,
          icon: leftIcon,
          label: (
            <>
              {item.subMenu}
              {rightIcon}
            </>
          ),
          children: renderMenu(item.children),
        }
      }

      if ('group' in item) {
        return {
          type: 'group',
          key: item.group,
          label: item.group,
          children: renderMenu(item.children),
        }
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
       *
       * TODO: check activeIfMatch with react-router v6
       */
      readonly activeIfMatch?:
        | string
        | string[]
        | PathPattern<string>
        | PathPattern<string>[]
    }
  | {
      /**
       * The label of the subnav
       */
      readonly subMenu: string
      readonly children: ReadonlyArray<MenuConfig>
      readonly icon?: React.ReactNode
      readonly activeIfMatch?:
        | string
        | string[]
        | PathPattern<string>
        | PathPattern<string>[]
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
