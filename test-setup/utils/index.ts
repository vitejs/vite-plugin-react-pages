import { test as base } from '@playwright/test'
import getPort from 'get-port'
import execa from 'execa'
import waitOn from 'wait-on'
import path from 'node:path'
import fs from 'fs-extra'
import { getFsUtils, setupActualTestPlayground } from './fsUtils'
export * from '@playwright/test'

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
  }
>({
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
    async ({ testPlayground }, use, workerInfo) => {
      // console.log('@@@@project', workerInfo.project)
      const port = await getPort()
      let subprocess
      try {
        // Start vite server.
        subprocess = execa(
          'pnpm',
          ['dev', '--strictPort', '--port', String(port)],
          {
            cwd: testPlayground.path,
            detached: true,
          }
        )
        // subprocess.stdout?.pipe(fs.createWriteStream('vite-stdout.txt'))
        subprocess.stdout?.pipe(process.stdout)
        subprocess.stderr?.pipe(process.stderr)

        // wait for the vite server to be available
        await Promise.race([
          // if subprocess faill, should throw early
          subprocess,
          waitOn({
            resources: [`http-get://localhost:${port}`],
            // should ignore http_proxy env variable from my shell...
            proxy: false as any,
            headers: { Accept: 'text/html' },
            timeout: 10 * 1000,
          }),
        ])

        console.log('vite serve is ready.')

        await use({ port })
      } finally {
        if (subprocess?.pid) {
          // https://stackoverflow.com/a/49842576
          // TODO: should check if it works on windows...
          process.kill(-subprocess?.pid)
        } else {
          subprocess?.kill()
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
