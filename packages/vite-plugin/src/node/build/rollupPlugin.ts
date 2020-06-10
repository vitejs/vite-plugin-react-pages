import type { Plugin } from 'vite'
import * as fs from 'fs-extra'
import * as path from 'path'

import pages from '../dynamic-modules/pages'
import onePage from '../dynamic-modules/onePage'
import { CLIENT_PATH } from '../constants'

type RollupPlugin = ArrayItemType<
  NonNullable<NonNullable<Plugin['rollupInputOptions']>['plugins']>
>

type ArrayItemType<Arr extends Array<any>> = Arr extends Array<infer R>
  ? R
  : never

export default (pagesDirPath: string): RollupPlugin => ({
  name: 'vite-pages-dynamic-modules',
  resolveId(importee) {
    if (importee === '/@generated/pages') {
      return importee
    }
    if (importee.startsWith('/@generated/pages/')) {
      return importee
    }
  },
  async load(id) {
    if (id === '/@generated/pages') {
      return pages(pagesDirPath)
    }
    if (id.startsWith('/@generated/pages/')) {
      const page = id.slice('/@generated/pages/'.length)
      const code = await onePage(page, pagesDirPath, (file) => file)
      if (!code) {
        throw new Error(`can't load "${id}"`)
      }
      return code
    }
  },
})
