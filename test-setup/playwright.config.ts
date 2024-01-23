import { resolve } from 'path'
import type {
  PlaywrightTestConfig,
  Project,
  PlaywrightTestOptions,
  PlaywrightWorkerOptions,
} from '@playwright/test'
import { devices } from '@playwright/test'
import { TestOptions } from './utils'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  /* Maximum time one test can run for. */
  timeout: process.env.CI ? 180 * 1000 : 180 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
  },
  // maxFailures: 1,
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: false,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [['dot'], ['html', { open: 'never' }], ['github']]
    : [['list'], ['html', { open: 'never' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [...testProjectConfig('use-theme-doc')],

  reportSlowTests: process.env.CI ? null : undefined,

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   port: 3000,
  // },
}

export default config

function testProjectConfig(
  playgroundName: string
): Project<PlaywrightTestOptions, PlaywrightWorkerOptions & TestOptions>[] {
  const testDir = resolvePlaygrould(playgroundName)

  // for each project, test in serve mode, build mode, and ssr mode
  const result: Project<
    PlaywrightTestOptions,
    PlaywrightWorkerOptions & TestOptions
  >[] = [
    {
      name: `${playgroundName}:serve`,
      use: {
        ...devices['Desktop Chrome'],
        vitePagesMode: 'serve',
      },
      testDir,
    },
    {
      name: `${playgroundName}:build`,
      use: {
        ...devices['Desktop Chrome'],
        vitePagesMode: 'build',
      },
      testDir,
    },
    {
      name: `${playgroundName}:ssr`,
      use: {
        ...devices['Desktop Chrome'],
        vitePagesMode: 'ssr',
      },
      testDir,
    },
  ]

  const vitePagesModeFilter = process.env['VITE_PAGES_MODE']
  if (!vitePagesModeFilter) return result
  return result.filter((project) => {
    return project.use?.vitePagesMode === vitePagesModeFilter
  })
}

function resolvePlaygrould(folder: string) {
  return resolve(__dirname, '../packages/playground', folder)
}
