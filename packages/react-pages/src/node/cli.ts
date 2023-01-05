import chalk from 'chalk'
import fs from 'fs-extra'
import minimist from 'minimist'
import path from 'node:path'
import { resolveConfig } from 'vite'
import { PKG_ROOT } from './constants'
import { ssrBuild } from './static-site-generation'
import type { staticSiteGenerationConfig } from './types'

const argv: any = minimist(process.argv.slice(2))

console.log(
  chalk.cyan(
    `vite-pages v${
      fs.readJSONSync(path.resolve(PKG_ROOT, 'package.json')).version
    }`
  )
)
// console.log(chalk.cyan(`vite v${require('vite/package.json').version}`))

// cli usage: vite-pages ssr [root] [--minifyHtml] [vite config like --outDir or --configFile]
const [command, root] = argv._
if (root) {
  argv.root = root
}

;(async () => {
  if (!command || command === 'ssr') {
    const toBeResovledConfig = {
      configFile: argv.configFile,
      build: {
        outDir: argv.outDir,
      },
    }

    // user can pass in vite config like --outDir or --configFile
    const viteConfig = await resolveConfig(
      toBeResovledConfig,
      'build',
      'production',
      'production'
    )
    const thisPlugin = viteConfig.plugins.find((plugin) => {
      return plugin.name === 'vite-plugin-react-pages'
    })
    //@ts-expect-error
    const ssrConfig = thisPlugin?.vitePagesStaticSiteGeneration as
      | staticSiteGenerationConfig
      | undefined

    await ssrBuild(viteConfig, argv, ssrConfig).catch((err: any) => {
      console.error(chalk.red(`ssr error:\n`), err)
      process.exit(1)
    })
  } else {
    console.error(
      `[vite-pages] Invalid command. CLI usage: vite-pages ssr [root] [--minifyHtml]  [vite config like --outDir or --configFile]`
    )
  }
})()
