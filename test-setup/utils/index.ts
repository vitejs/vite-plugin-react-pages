import { test as base } from '@playwright/test'
import path from 'node:path'
import fs from 'fs-extra'
import { getFsUtils, setupActualTestPlayground } from './fsUtils'
import {
  startBuildServer,
  startSSRServer,
  startViteDevServer,
} from './startServer'
export * from '@playwright/test'

export type TestOptions = {
  vitePagesMode: 'serve' | 'build' | 'ssr'
}

export const test = base.extend<
  {},
  {
    testPlayground: {
      name: string
      path: string
      restore: (subPath?: string) => Promise<void>
    }
    server: { port: number }
    fsUtils: ReturnType<typeof getFsUtils>
  } & TestOptions
>({
  vitePagesMode: ['serve', { option: true, scope: 'worker' }],
  testPlayground: [
    async ({}, use, workerInfo) => {
      const testDir = workerInfo.project.testDir
      if (!(await fs.pathExists(testDir)))
        throw new Error(`testDir not exists: ${testDir}`)
      const playgroundName = path.basename(testDir)
      const { playgroundPath, restore } = await setupActualTestPlayground(
        playgroundName,
        workerInfo.workerIndex.toString()
      )
      await use({
        name: playgroundName,
        path: playgroundPath,
        restore,
      })
    },
    { scope: 'worker', auto: true },
  ],
  server: [
    async ({ testPlayground, vitePagesMode }, use, workerInfo) => {
      const vars: { port?: number; subprocess?: any } = {}
      try {
        if (vitePagesMode === 'serve') {
          await startViteDevServer(testPlayground.path, vars)
        } else if (vitePagesMode === 'build') {
          await startBuildServer(testPlayground.path, vars)
        } else if (vitePagesMode === 'ssr') {
          await startSSRServer(testPlayground.path, vars)
        }
        if (!vars.port || !vars.subprocess) throw new Error('assertion fail')
        await use({ port: vars.port })
      } finally {
        if (vars.subprocess?.pid) {
          // https://stackoverflow.com/a/49842576
          // TODO: should check if it works on windows...
          process.kill(-vars.subprocess?.pid)
        } else {
          vars.subprocess?.kill()
        }
      }
    },
    { scope: 'worker', auto: true },
  ],
  baseURL: async ({ baseURL, server }, use) => {
    await use(`http://localhost:${server.port}`)
  },
  page: async ({ baseURL, page, server }, use) => {
    // double check if this fixture works
    if (baseURL !== `http://localhost:${server.port}`)
      throw new Error('unexpected baseURL')
    await page.goto(baseURL)
    await use(page)
  },
  fsUtils: [
    async ({ testPlayground }, use, workerInfo) => {
      await use(getFsUtils(testPlayground.path))
    },
    { scope: 'worker' },
  ],
})
