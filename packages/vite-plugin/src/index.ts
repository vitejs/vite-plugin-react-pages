import type { Plugin } from 'vite'
import * as path from 'path'
import { configureServer } from './node/configureServer'

export interface IOption {
  pagesDir: string
}

function createPlugin({ pagesDir }: IOption): Plugin {
  return {
    configureServer: configureServer(pagesDir),
    alias: {
      '/@infra/': path.join(__dirname, 'client'),
    },
  }
}

export default createPlugin
