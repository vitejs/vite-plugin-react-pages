# Contributing Guide

## Repo setup

This repo uses [pnpm](https://pnpm.io/) to manage monorepo.

1. Run `pnpm install` in the repo root folder to install and link dependencies.
2. Run `pnpm run build` in the repo root folder to build all packages. You can also do that manually by running `pnpm run build` in folders `packages/react-pages` and `packages/theme-doc`.
3. Run `pnpm run dev` in the repo root folder to build and watch all packages. You can also do that manually by running `pnpm run dev` in folders `packages/react-pages` and `packages/theme-doc`. It will rebuild automatically whenever you change the package source code. So we prefer `pnpm run dev` to `pnpm run build` when changing source code frequently.

## Running playgrounds

```sh
cd packages/playground/use-theme-doc/  # or other playgrounds
pnpm run dev
pnpm run build
pnpm run ssr
```

> Notice that the playground [import theme-doc from it's src](https://github.com/vitejs/vite-plugin-react-pages/blob/2b2c33aca69e76f89a52e16f27840106c8e56fdb/packages/playground/use-theme-doc/pages/themeDev.tsx#L4) so that we can get hmr when editing theme-doc's source files. This setup should only be used during theme development and it's not for package users.

## Debugging

To use breakpoints and explore code execution, you can use the ["Run and Debug"](https://code.visualstudio.com/docs/editor/debugging) feature from **VS Code**.

1. Add a `debugger` statement where you want to stop the code execution.
2. If you add `debugger` to the source code of a package, make sure to use `pnpm run build` or `pnpm run dev` to build the package after modifying the code.
3. Click the "Run and Debug" icon in the activity bar of VS Code, which opens the [_Run and Debug view_](https://code.visualstudio.com/docs/editor/debugging#_run-and-debug-view).
4. Click the "JavaScript Debug Terminal" button in the _Run and Debug view_, which opens a terminal in VS Code.
5. From that terminal, go to `packages/playground/xxx`, and run `pnpm run dev` or `pnpm run build` or `pnpm run ssr`.
6. The execution will stop at the `debugger` statement, and you can use the [Debug toolbar](https://code.visualstudio.com/docs/editor/debugging#_debug-actions) to continue, step over, and restart the process...

## Running tests

This project uses [playwright](https://playwright.dev/) to run integration tests.

If you are running tests for the first time in this repo, you should run `pnpm run install-test-deps` in repo root folder to install test deps.

After having test deps installed, run `pnpm run test` to run all tests.
Or run `pnpm run test-serve` to run tests in vite serve mode only.
Or run `pnpm run test-build` to run tests in vite build mode only.
Or run `pnpm run test-ssr` to run tests in ssr mode only.

Run `pnpm run test file-name-filter` to filter on file name. For example, `pnpm run test hmr` will run tests in `packages/playground/use-theme-doc/__tests__/hmr.spec.ts`.

Adding `--debug` after any test command will make it run in debug mode. For example, `pnpm run test hmr --debug`. With this mode enabled, you can play with browser developer tools, exploring selectors, and stop test with `await page.pause()`. Checkout [playwright debug doc](https://playwright.dev/docs/debug#playwright-inspector) to learn more.

Checkout more test arguments at [playwright doc](https://playwright.dev/docs/test-cli). Most notable arguments are:

- `--debug`
- `--max-failures=1` make test stop when it encounter the first error, so that you can tackle one problem at a time.
- `--headed`
- `--workers=1` prevent playwright using multiple thread to run tests in parallel.

## Writing tests

Currently all runnable tests are located at `packages/playground/use-theme-doc/__tests__/`. You can see them as examples.

Test utils are set up at `test-setup/utils/index.ts`. They are [playwright test fixtures](https://playwright.dev/docs/test-fixtures).
