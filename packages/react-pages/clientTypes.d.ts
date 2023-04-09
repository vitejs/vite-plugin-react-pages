// users can import type { PagesStaticData } from "vite-plugin-react-pages/clientTypes"
import React from 'react'

export * from './theme.doc.d'

export interface PagesInternal {
  readonly [routePath: string]: {
    readonly data: () => Promise<PageLoaded>
    readonly staticData: any
  }
}

// the result of tsInfo extraction
export type TsInfo =
  | {
      // example: type A = { k: v }
      type: 'object-literal'
      name: string
      description: string
      properties: TsPropertyOrMethodInfo[]
    }
  | {
      // example: interface MyInterface { k: v }
      type: 'interface'
      name: string
      description: string
      properties: TsPropertyOrMethodInfo[]
    }
  | {
      // complex type literal
      // example: type A = 'asd' | 123
      type: 'other'
      name: string
      description: string
      text: string
    }
export interface TsPropertyOrMethodInfo {
  name: string
  type: string
  description: string
  defaultValue: string | undefined
  optional: boolean
}

export type UseAllPagesOutlines = (timeout: number) => any

export type SSRPlugin = {
  id: string
  prepare: (app: React.ReactNode) => {
    app?: React.ReactNode
    extractStyle?: () => string
  }
}
