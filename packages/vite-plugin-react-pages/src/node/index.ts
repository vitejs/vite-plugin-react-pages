import type { Plugin } from 'vite'
import * as path from 'path'

import { configureServer } from './configureServer'
import rollupPlugin from './build/rollupPlugin'
import { CLIENT_PATH } from './constants'
import type { IFindPagesHelpers } from './dynamic-modules/pages'

function createPlugin(
  pagesDir: string = path.join(process.cwd(), 'pages'),
  findPages?: (helpers: IFindPagesHelpers) => Promise<void>
): Plugin {
  return {
    configureServer: configureServer(pagesDir, findPages),
    alias: {
      '/@pages-infra/': CLIENT_PATH,
    },
    rollupInputOptions: {
      plugins: [rollupPlugin(pagesDir, findPages)],
    },
  }
}

export default createPlugin

export { ssrBuild } from './build/ssr'
export { extractStaticData } from './dynamic-modules/pages'

export type { ITheme, IPagesStaticData, IPagesLoaded } from '../client/types'
export type { IPageData } from './dynamic-modules/pages'
