import { test as baseTest, expect } from '~utils'

import { declareTests } from './navigate-tests'

const test = baseTest.extend<{}, {}>({
  beforeStartViteServer: [
    async ({ fsUtils }, use) => {
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
    { option: true, scope: 'worker' } as any,
  ],
})

declareTests({ javaScriptEnabled: true, test, isCjs: true })
