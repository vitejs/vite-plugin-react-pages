const argv = require('minimist')(process.argv.slice(2))

;(async () => {
  if (argv._[0]) {
    argv.command = argv._[0]
  }

  switch (argv.command) {
    case 'ssr':
      const viteOptions = await require('vite').resolveConfig('')
      if (!viteOptions) {
        throw new Error(`can't resolve vite config. cwd: "${process.cwd()}"`)
      }
      await require('../dist/node').ssrBuild(viteOptions)
      process.exit(0)

    default:
      console.error(`invalid command. command should be "ssr"`)
      break
  }
})()
