import type { Plugin } from 'vite'
import { configureServer } from './node/configureServer'
import { CLIENT_PATH } from './node/constants'

export interface IOption {
  pagesDir?: string
}

function createPlugin({ pagesDir }: IOption = {}): Plugin {
  return {
    configureServer: configureServer(pagesDir),
    alias: {
      '/@pages-infra/': CLIENT_PATH,
    },
  }
}

export default createPlugin
