import type { Plugin } from 'vite'
import { configureServer } from './configureServer'
import { CLIENT_PATH } from './constants'

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
