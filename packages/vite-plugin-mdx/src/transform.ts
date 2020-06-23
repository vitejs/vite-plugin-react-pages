import { startService, Service } from 'esbuild'
import { reactRefreshTransform } from 'vite-plugin-react/dist/transform'
import mdx from '@mdx-js/mdx'

const DEFAULT_RENDERER = `
import React from 'react'
import { mdx } from '@mdx-js/react'
`

export async function transformMdx({
  code,
  mdxOpts,
  forHMR,
  path,
}: {
  code: string
  mdxOpts?: any
  forHMR?: boolean
  path?: string
}) {
  const jsx = await mdx(code, mdxOpts)
  const esBuild = await ensureEsbuildService()
  const { js } = await esBuild.transform(jsx, {
    loader: 'jsx',
    target: 'es2019',
    jsxFactory: 'mdx',
  })
  const withoutHMR = `${DEFAULT_RENDERER}\n${js}`
  if (!forHMR) {
    // don't need HMR ability
    return withoutHMR
  }
  if (!path) {
    throw new Error(`path should be given when transforming for HMR.`)
  }
  // make mdx React component hmr-self-accepting
  const withHMR = reactRefreshTransform.transform({
    code: withoutHMR,
    path,
  } as any)
  return withHMR
}

let _service: Service | undefined
async function ensureEsbuildService() {
  if (!_service) {
    _service = await startService()
  }
  return _service
}
