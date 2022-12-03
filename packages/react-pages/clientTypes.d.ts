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
export interface TsInterfaceInfo {
  name: string
  // commentText: string
  description: string
  // fullText: string
  properties: TsInterfacePropertyInfo[]
}

export interface TsInterfacePropertyInfo {
  name: string
  // commentText: string
  type: string
  description: string
  defaultValue: string | undefined
  // fullText: string
  optional: boolean
}

export type UseAllPagesOutlines = (timeout: number) => any
