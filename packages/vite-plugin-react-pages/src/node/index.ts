import type { Plugin } from 'vite'
import * as path from 'path'

import { configureServer } from './configureServer'
import rollupPlugin from './build/rollupPlugin'
import { CLIENT_PATH } from './constants'
import type { IPageFiles } from './dynamic-modules/pages'

function createPlugin(
  pagesDir: string = path.join(process.cwd(), 'pages'),
  findPageFiles?: () => Promise<IPageFiles>
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
export { defaultFindPageFiles } from './dynamic-modules/pages'
export type { IPages, ICreateTheme, ITheme } from '../client/types'
export type { IPageFile, IPageFiles } from './dynamic-modules/pages'
