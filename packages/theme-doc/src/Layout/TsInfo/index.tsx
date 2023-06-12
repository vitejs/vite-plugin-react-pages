import React, { useMemo } from 'react'
import type {
  TsInfo as TsInfoData,
  TsPropertyOrMethodInfo,
  CallSignatureInfo,
} from 'vite-plugin-react-pages/clientTypes'
import { Table, Collapse } from 'antd'
import type { CollapseProps, TableColumnsType } from 'antd'

import { withMdClassName } from '../MDX'
import s from './index.module.less'

// apply md style
const Code = withMdClassName('code')
const Strong = withMdClassName('strong')

interface Props {
  data: TsInfoData
  className?: string
}

const memberColumns: TableColumnsType<TsPropertyOrMethodInfo> = [
  {
    title: 'Name',
    dataIndex: 'name',
  },
  {
    title: 'Description',
    dataIndex: 'description',
  },
  {
    title: 'Type',
    dataIndex: 'type',
    render: (_type) => {
      const type = _type.trim()
      if (!type) return null
      return <Code>{type}</Code>
    },
  },
  {
    title: 'Default Value',
    dataIndex: 'defaultValue',
    render: (_, row) => {
      if (row.defaultValue) return <Code>{row.defaultValue}</Code>
      if (row.optional) return ''
      return (
        <span>
          Required<span style={{ color: 'red' }}>*</span>
        </span>
      )
    },
  },
]

const signatureColumns: TableColumnsType<CallSignatureInfo> = [
  {
    title: 'Type',
    dataIndex: 'type',
    render: (_type) => {
      const type = _type.trim()
      if (!type) return null
      return <Code>{type}</Code>
    },
  },
  {
    title: 'Description',
    dataIndex: 'description',
  },
]

const complexTypeColumns: TableColumnsType<any> = [
  {
    title: 'Name',
    dataIndex: 'name',
  },
  {
    title: 'Description',
    dataIndex: 'description',
  },
  {
    title: 'Type',
    dataIndex: 'text',
    render: (_type) => {
      const type = _type.trim()
      if (!type) return null
      return <Code>{type}</Code>
    },
  },
]

export function TsInfo({ data, className: _className }: Props) {
  const className = [_className, s.ctn].filter(Boolean).join(' ')

  if (data.type === 'interface' || data.type === 'object-literal') {
    const items: CollapseProps['items'] = [
      {
        key: 'Members',
        label: (
          <span>
            <Strong>Members</Strong>
          </span>
        ),
        children: (
          <Table
            columns={memberColumns}
            dataSource={data.properties}
            size="middle"
            pagination={false}
          />
        ),
      },
    ]
    if (data.callSignatures.length > 0) {
      items.unshift({
        key: 'Call Signatures',
        label: (
          <span>
            <Strong>Call Signatures</Strong>
          </span>
        ),
        children: (
          <Table
            columns={signatureColumns}
            dataSource={data.callSignatures}
            size="middle"
            pagination={false}
          />
        ),
      })
    }
    if (data.constructSignatures.length > 0) {
      items.unshift({
        key: 'Construct Signatures',
        label: (
          <span>
            <Strong>Construct Signatures</Strong>
          </span>
        ),
        children: (
          <Table
            columns={signatureColumns}
            dataSource={data.constructSignatures}
            size="middle"
            pagination={false}
          />
        ),
      })
    }

    return (
      <Collapse
        className={className}
        items={items}
        defaultActiveKey={items.map((v) => v.key!)}
      />
    )
  }

  if (data.type === 'other') {
    const items: CollapseProps['items'] = [
      {
        key: 'Members',
        label: (
          <span>
            <Strong>Members</Strong>
          </span>
        ),
        children: (
          <Table
            columns={complexTypeColumns}
            dataSource={[data]}
            size="middle"
            pagination={false}
          />
        ),
      },
    ]

    return (
      <Collapse
        className={className}
        items={items}
        defaultActiveKey={items.map((v) => v.key!)}
      />
    )
  }

  return (
    <pre>{`TsInfo Error: <TsInfo> component receives invalid props.
If you use it in jsx, you should import tsInfo like "import * as tsInfo from './path/to/type.ts?tsInfo=InterfaceName'" and render it like "<TsInfo {...tsInfo}>"
If you use it in markdown, you should use it exactly like "<TsInfo src="./path/to/type.ts" name="ButtonProps" />" (we use simple regexp to parse it, so you should use this format strictly)
`}</pre>
  )
}
