import { test as baseTest, expect } from '~utils'

import { declareTests } from './navigate-tests'

const test = baseTest.extend<{}, {}>({
  beforeStartViteServer: [
    async ({ fsUtils }, use) => {
      await use(async () => {
        fsUtils.editFile('package.json', (str) => {
          return str.replace('"type": "module"', '"type": "commonjs"')
        })
      })
    },
    { scope: 'worker', option: true } as any,
  ],
})

declareTests({ javaScriptEnabled: true, test, isCjs: true })
