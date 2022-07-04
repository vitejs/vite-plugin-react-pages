import { test as base } from '@playwright/test'
import getPort from 'get-port'
import execa from 'execa'
import waitOn from 'wait-on'
export * from '@playwright/test'

export const test = base.extend<{}, { server: { port: number } }>({
  server: [
    async ({}, use, workerInfo) => {
      // console.log('@@@@project', workerInfo.project)
      const port = await getPort()
      let subprocess
      try {
        // Start vite server.
        subprocess = execa(
          'pnpm',
          ['dev', '--strictPort', '--port', String(port)],
          {
            cwd: workerInfo.project.testDir,
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
})
