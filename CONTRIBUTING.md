# Contributing Guide

## pnpm

This project uses pnpm to manage monorepo. You should run `pnpm i` after cloning this repo.

## Tests

The test setup is copied from [vite](https://github.com/vitejs/vite/blob/f6b58a0f535b1c26f9c1dfda74c28c685402c3c9/jest.config.js#L1). Fixtures and test cases is under `packages/playground`.

> There must be no more than one `.spec.ts` file for each fixture. Otherwise it will cause Error like `Error: EEXIST: file already exists, mkdir '/home/csr/vite-plugin-react-pages/temp/basic'`. There is some flaws with current test setup (which is copied from vite's repo).

## Run playgrounds

```sh
cd packages/playground/basic/  # or other playgrounds
npm run dev
```
