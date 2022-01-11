import chalk from 'chalk'
import minimist from 'minimist'
import { resolveConfig } from 'vite'
import { ssrBuild } from './static-site-generation'

const argv: any = minimist(process.argv.slice(2))

console.log(chalk.cyan(`vite-pages v${require('../../package.json').version}`))
console.log(chalk.cyan(`vite v${require('vite/package.json').version}`))

// cli usage: vite-pages ssr [root] [vite config like --outDir or --configFile]
const [command, root] = argv._
if (root) {
  argv.root = root
}

;(async () => {
  if (!command || command === 'ssr') {
    // user can pass in vite config like --outDir or --configFile
    const viteConfig = await resolveConfig(argv, 'build')
    const thisPlugin = viteConfig.plugins.find((plugin) => {
      return plugin.name === 'vite-plugin-react-pages'
    })
    // @ts-expect-error
    const ssrConfig = thisPlugin?.vitePagesStaticSiteGeneration

    await ssrBuild(viteConfig, ssrConfig, argv).catch((err: any) => {
      console.error(chalk.red(`ssr error:\n`), err)
      process.exit(1)
    })
  } else {
    console.error(
      `[vite-pages] Invalid command. CLI usage: vite-pages ssr [root] [vite config like --outDir or --configFile]`
    )
  }
})()
