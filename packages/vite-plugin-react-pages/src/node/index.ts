import type { Plugin } from 'vite'
import * as path from 'path'

import { configureServer } from './configureServer'
import rollupPlugin from './build/rollupPlugin'
import { CLIENT_PATH } from './constants'
import type { IPageData, IFindPagesHelpers } from './dynamic-modules/pages'

function createPlugin(
  pagesDir: string = path.join(process.cwd(), 'pages'),
  findPageFiles?: (helpers: IFindPagesHelpers) => Promise<IPageData[]>
): Plugin {
  return {
    configureServer: configureServer(pagesDir, findPageFiles),
    alias: {
      '/@pages-infra/': CLIENT_PATH,
    },
    rollupInputOptions: {
      plugins: [rollupPlugin(pagesDir, findPageFiles)],
    },
  }
}

export default createPlugin

export { ssrBuild } from './build/ssr'
export { defaultFindPages } from './dynamic-modules/find-pages-strategy/default'
export { findPagesFromGlob } from './dynamic-modules/find-pages-strategy/fromGlob'
export { extractStaticData } from './dynamic-modules/pages'

export type { IPages, ICreateTheme, ITheme } from '../client/types'
export type { IPageData } from './dynamic-modules/pages'
