import { test } from '~utils'
import { declareTests } from './navigate-tests'

test.use({
  beforeStartViteServer: async ({ fsUtils }, use) => {
    await use(async () => {
      fsUtils.editFile('package.json', (str: string) => {
        if (!str.includes('"type": "module"'))
          throw new Error(
            'unexpected package.json：should includes type:module'
          )
        return str.replace('"type": "module"', '"type": "commonjs"')
      })
    })
  },
})

declareTests()
