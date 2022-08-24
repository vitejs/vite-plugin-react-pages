import { test, expect } from '~utils'

import { declareTests } from './navigate-tests'

test.beforeAll(({ fsUtils, testPlayground }) => {
  fsUtils.editFile('package.json', (str) => {
    return str.replace('"type": "module"', '"type": "commonjs"')
  })
})

test.beforeEach(({ fsUtils, testPlayground }) => {
  const pkgJson = JSON.parse(fsUtils.readFile('package.json'))
  expect(pkgJson.type).toBe('commonjs')
  console.log('@@@pkgJson.type', pkgJson.type)
})

declareTests({ javaScriptEnabled: true, isCjs: true })
