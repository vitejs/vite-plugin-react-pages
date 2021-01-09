import chalk from 'chalk'
import minimist from 'minimist'
import { resolveConfig } from 'vite'
import { ssrBuild } from './static-site-generation'

const argv: any = minimist(process.argv.slice(2))

console.log(chalk.cyan(`vite-pages v${require('../../package.json').version}`))
console.log(chalk.cyan(`vite v${require('vite/package.json').version}`))

const command = argv._[0]
const root = argv._[command ? 1 : 0]
if (root) {
  argv.root = root
}

;(async () => {
  if (!command || command === 'ssr') {
    // user can pass --root or --configFile
    const viteConfig = await resolveConfig(argv, 'build')
    const thisPlugin = viteConfig.plugins.find((plugin) => {
      return plugin.name === 'vite-plugin-react-pages'
    })
    // @ts-ignore
    const ssrConfig = thisPlugin?.vitePagesStaticSiteGeneration

    await ssrBuild(viteConfig, ssrConfig, argv).catch((err: any) => {
      console.error(chalk.red(`ssr error:\n`), err)
      process.exit(1)
    })
  } else {
    console.error(`invalid command. command should be "ssr"`)
  }
})()
