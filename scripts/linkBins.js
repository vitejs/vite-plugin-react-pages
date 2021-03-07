const linkBins = require('@pnpm/link-bins').default
const path = require('path')
const fs = require('fs-extra')

;(async () => {
  // link bins from node_modules/.bin
  // to packages/playground/<fixture>/node_modules/.bin
  // so that we can use vite in those fixtures without installing

  const root = path.join(__dirname, '../')
  const sourcePath = path.join(root, 'node_modules')
  const playgroundPath = path.join(root, 'packages/playground')

  let fixtures = await fs.readdir(playgroundPath)
  fixtures = fixtures.filter(
    (fixtureName) =>
      fixtureName !== 'node_modules' &&
      fs.statSync(path.join(playgroundPath, fixtureName)).isDirectory()
  )

  await Promise.all(
    fixtures.map(async (fixtureName) => {
      const fixturePath = path.join(playgroundPath, fixtureName)
      const fixtureBinPath = path.join(fixturePath, 'node_modules/.bin')
      console.log('Linking bins to', fixtureBinPath)
      await linkBins(sourcePath, fixtureBinPath, {
        warn,
      })
    })
  )
})()

function warn(msg) {
  console.warn(msg)
}
