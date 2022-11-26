import execa from 'execa'
import waitOn from 'wait-on'
import getPort from 'get-port'
import { isWindows } from './utils';

export async function startViteDevServer(
  playgroundPath: string,
  returnValues: { port?: number; subprocess?: any }
) {
  const port = await getPort()
  returnValues.port = port

  await startServer(playgroundPath, returnValues, [
    'dev',
    '--strictPort',
    '--port',
    port.toString(),
  ])

  console.log('vite dev server is ready.')
}

export async function startBuildServer(
  playgroundPath: string,
  returnValues: { port?: number; subprocess?: any }
) {
  const port = await getPort()
  returnValues.port = port

  await startServer(playgroundPath, returnValues, [
    'build',
    '--no-port-switching',
    '-p',
    port.toString(),
  ])

  console.log('build server is ready.')
}

export async function startSSRServer(
  playgroundPath: string,
  returnValues: { port?: number; subprocess?: any }
) {
  const port = await getPort()
  returnValues.port = port

  await startServer(playgroundPath, returnValues, [
    'ssr',
    '--no-port-switching',
    '-p',
    port.toString(),
  ])

  console.log('ssr server is ready.')
}

export async function startServer(
  playgroundPath: string,
  returnValues: { port?: number; subprocess?: any },
  args: string[]
) {
  if (!returnValues.port || returnValues.subprocess)
    throw new Error('assertion fail')

  const subprocess = execa('pnpm', args, {
    cwd: playgroundPath,
    // on unix, we pass detached: true,
    // so that we can use process.kill(-subprocess.pid)
    // in killProcess()
    detached: !isWindows,
  })
  subprocess.stdout?.pipe(process.stdout)
  subprocess.stderr?.pipe(process.stderr)
  // return values early so caller can handler error
  returnValues.subprocess = subprocess
  // wait for the server to be available
  await Promise.race([
    waitOn({
      resources: [`http-get://localhost:${returnValues.port}`],
      // should ignore http_proxy env variable from my shell...
      proxy: false as any,
      headers: { Accept: 'text/html' },
      timeout: process.env.CI ? 180 * 1000 : 180 * 1000,
    }),
    // if the subprocess faill, it should throw too
    subprocess,
  ])
}
