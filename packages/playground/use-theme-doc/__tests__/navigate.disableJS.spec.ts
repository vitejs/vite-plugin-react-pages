import { test } from '~utils'
import { declareTests } from './navigate-tests'

test.use({ javaScriptEnabled: false })

test.skip(
  ({ vitePagesMode }) => vitePagesMode !== 'ssr',
  'only run in ssr mode'
)

test.use({
  skipPrepare: async ({ vitePagesMode }, use) => {
    await use(vitePagesMode !== 'ssr')
  },
})

declareTests({ javaScriptEnabled: false })
