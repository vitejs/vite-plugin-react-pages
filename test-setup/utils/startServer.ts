import execa from 'execa'
import waitOn from 'wait-on'
import getPort from 'get-port'

export async function startViteDevServer(
  playgroundPath: string,
  returnValues: { port?: number; subprocess?: any }
) {
  const port = await getPort()
  returnValues.port = port

  // Start vite dev server.
  const subprocess = execa(
    'pnpm',
    ['dev', '--strictPort', '--port', String(port)],
    {
      cwd: playgroundPath,
      detached: true,
    }
  )
  subprocess.stdout?.pipe(process.stdout)
  subprocess.stderr?.pipe(process.stderr)
  // return values early so caller can handler error
  returnValues.subprocess = subprocess

  // wait for the server to be available
  await Promise.race([
    waitOn({
      resources: [`http-get://localhost:${port}`],
      // should ignore http_proxy env variable from my shell...
      proxy: false as any,
      headers: { Accept: 'text/html' },
      timeout: 10 * 1000,
    }),
    // if subprocess faill, it should throw too
    subprocess,
  ])

  console.log('vite dev server is ready.')
}

export async function startBuildServer(
  playgroundPath: string,
  returnValues: { port?: number; subprocess?: any }
) {
  const port = await getPort()
  returnValues.port = port

  // build and start http server
  const subprocess = execa(
    'pnpm',
    ['build', '--no-port-switching', '-p', String(port)],
    {
      cwd: playgroundPath,
      detached: true,
    }
  )
  subprocess.stdout?.pipe(process.stdout)
  subprocess.stderr?.pipe(process.stderr)
  // return values early so caller can handler error
  returnValues.subprocess = subprocess

  // wait for the server to be available
  await Promise.race([
    waitOn({
      resources: [`http-get://localhost:${port}`],
      // should ignore http_proxy env variable from my shell...
      proxy: false as any,
      headers: { Accept: 'text/html' },
      timeout: 30 * 1000,
    }),
    // if subprocess faill, it should throw too
    subprocess,
  ])

  console.log('build server is ready.')
}
