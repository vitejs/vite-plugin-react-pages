import type { Plugin } from 'vite'
import * as path from 'path'

import { configureServer } from './configureServer'
import rollupPlugin from './build/rollupPlugin'
import { CLIENT_PATH } from './constants'
import type { IFindPagesHelpers } from './dynamic-modules/pages'

type IFindPages = (helpers: IFindPagesHelpers) => Promise<void>
type IOpts = {
  pagesDir?: string
  findPages?: IFindPages
  useHashRouter?: boolean
}

function createPlugin(pagesDir?: string, findPages?: IFindPages): Plugin
function createPlugin(opts: IOpts): Plugin
function createPlugin(
  pagesDirOrOpts?: string | IOpts,
  _findPages?: IFindPages
): Plugin {
  const opts: IOpts = (() => {
    if (!pagesDirOrOpts) return {}
    if (typeof pagesDirOrOpts === 'object') return pagesDirOrOpts
    return { pagesDir: pagesDirOrOpts, findPages: _findPages } as IOpts
  })()
  const {
    pagesDir = path.join(process.cwd(), 'pages'),
    findPages,
    useHashRouter = false,
  } = opts

  return {
    configureServer: configureServer(pagesDir, findPages),
    alias: {
      '/@pages-infra/': CLIENT_PATH,
    },
    rollupInputOptions: {
      plugins: [rollupPlugin(pagesDir, findPages)],
    },
    define: {
      __HASH_ROUTER__: !!useHashRouter,
    },
  }
}

export default createPlugin

export { ssrBuild } from './build/ssr'
export { extractStaticData } from './dynamic-modules/pages'

export type { ITheme, IPagesStaticData, IPagesLoaded } from '../client/types'
export type { IPageData } from './dynamic-modules/pages'
