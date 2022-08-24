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
  beforeStartViteServer: (...args: any[]) => any
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
  beforeStartViteServer: [
    async ({}, use) => {
      // beforeStartViteServer default to be no-op
      await use(() => {})
    },
    { option: true, scope: 'worker' },
  ],
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
    async (
      { testPlayground, vitePagesMode, beforeStartViteServer },
      use,
      workerInfo
    ) => {
      await beforeStartViteServer?.()
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
        if (vars.subprocess) killProcess(vars.subprocess)
      }
    },
    { scope: 'worker', auto: true },
  ],
  fsUtils: [
    async ({ testPlayground }, use) => {
      await use(getFsUtils(testPlayground.path))
    },
    { scope: 'worker' },
  ],
  baseURL: async ({ server }, use) => {
    await use(`http://localhost:${server.port}`)
  },
  // if you are running tests in wsl, and you get error:
  // Timeout exceeded while running fixture "page" setup
  // You may have forgotten to start VcXsrv (XLaunch)
  // Ref: how to run e2e tests in wsl:
  // https://shouv.medium.com/how-to-run-cypress-on-wsl2-989b83795fb6
  page: async ({ baseURL, page, server }, use) => {
    // double check if this fixture works
    if (baseURL !== `http://localhost:${server.port}`)
      throw new Error('unexpected baseURL')

    // const res = await axios.get(baseURL, {
    //   timeout: 5000,
    //   headers: { Accept: 'text/html' },
    // })
    // console.log('@@baseURL.data', res.data)

    await page.goto(baseURL)
    await use(page)
  },
})

const isWindows = process.platform === 'win32'
import { commandSync, type ExecaChildProcess } from 'execa'

export async function killProcess(subprocess: ExecaChildProcess) {
  if (isWindows) {
    // ref: https://github.com/vitejs/vite/blob/f9b5c14c42bf0a5c7d4ca4b53160047306fb07c5/playground/test-utils.ts#L281
    commandSync(`taskkill /pid ${subprocess.pid} /T /F`)
  } else if (subprocess.pid) {
    // https://stackoverflow.com/a/49842576
    process.kill(-subprocess.pid)
  } else {
    subprocess.kill()
  }
}
