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
  skipPrepare: boolean
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
    fsUtils: ReturnType<typeof getFsUtils>
    server: { port: number }
  } & TestOptions
>({
  vitePagesMode: ['serve', { option: true, scope: 'worker' }],
  skipPrepare: [false, { option: true, scope: 'worker' }],
  beforeStartViteServer: [
    async ({}, use) => {
      // beforeStartViteServer default to be no-op
      await use(() => {})
    },
    { option: true, scope: 'worker' },
  ],
  testPlayground: [
    async ({ skipPrepare }, use, workerInfo) => {
      if (skipPrepare) {
        await use(null as any)
        return
      }
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
  fsUtils: [
    async ({ skipPrepare, testPlayground }, use) => {
      if (skipPrepare) {
        await use(null as any)
        return
      }
      await use(getFsUtils(testPlayground.path))
    },
    { scope: 'worker' },
  ],
  server: [
    async (
      { testPlayground, vitePagesMode, beforeStartViteServer, skipPrepare },
      use,
      workerInfo
    ) => {
      if (skipPrepare) {
        await use(null as any)
        return
      }
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
  baseURL: async ({ skipPrepare, server, baseURL }, use) => {
    await use(skipPrepare ? baseURL : `http://localhost:${server.port}`)
  },
  // if you are running tests in wsl, and you get error:
  // Timeout exceeded while running fixture "page" setup
  // You may have forgotten to start VcXsrv (XLaunch)
  // Ref: how to run e2e tests in wsl:
  // https://shouv.medium.com/how-to-run-cypress-on-wsl2-989b83795fb6
  page: async ({ baseURL, page }, use) => {
    if (baseURL) {
      // const res = await axios.get(baseURL, {
      //   timeout: 5000,
      //   headers: { Accept: 'text/html' },
      // })
      // console.log('@@baseURL.data', res.data)
      await page.goto(baseURL)
    }
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
    if (subprocess.exitCode === null) {
      // https://stackoverflow.com/a/49842576
      process.kill(-subprocess.pid)
    }
  } else {
    subprocess.kill()
  }
}
