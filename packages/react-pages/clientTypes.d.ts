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
      callSignatures: CallSignatureInfo[]
      constructSignatures: CallSignatureInfo[]
    }
  | {
      // example: interface MyInterface { k: v }
      type: 'interface'
      name: string
      description: string
      properties: TsPropertyOrMethodInfo[]
      callSignatures: CallSignatureInfo[]
      constructSignatures: CallSignatureInfo[]
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
export interface CallSignatureInfo {
  type: string
  description: string
}

export type UseAllPagesOutlines = (timeout: number) => any

export type SSRPlugin = {
  id: string
  prepare: (app: React.ReactNode) => {
    app?: React.ReactNode
    extractStyle?: () => string
  }
}
