import { startService, Service } from 'esbuild'
import mdx from '@mdx-js/mdx'

const DEFAULT_RENDERER = `
import React from 'react'
import { mdx } from '@mdx-js/react'
`

export async function transformMdx({
  code,
  mdxOpts,
  forHMR,
  id,
}: {
  code: string
  mdxOpts?: any
  forHMR?: boolean
  id?: string
}): Promise<string> {
  const jsx = await mdx(code, mdxOpts)
  const esBuild = await ensureEsbuildService()
  const { code: esbuildOut } = await esBuild.transform(jsx, {
    loader: 'jsx',
    target: 'es2019',
    jsxFactory: 'mdx',
  })

  const withoutHMR = `${DEFAULT_RENDERER}\n${esbuildOut}`

  if (!forHMR) {
    // don't need HMR ability
    return withoutHMR
  }

  if (!id) {
    throw new Error(`path should be given when transforming for HMR.`)
  }
  return applyHMR(withoutHMR, id)
}

let _service: Promise<Service> | undefined
async function ensureEsbuildService() {
  if (!_service) {
    _service = startService()
  }
  return _service
}
export async function stopService() {
  if (_service) {
    const service = await _service
    service.stop()
    _service = undefined
  }
}

function applyHMR(code: string, id: string): string {
  const { transformSync } = require('@babel/core')

  // make mdx React component hmr-self-accepting
  // forked from @vitejs/plugin-react-refresh
  // https://github.com/vitejs/vite/blob/eedd4353a07580fb3118a76f6ed0aa783d1c4bff/packages%2Fplugin-react-refresh%2Findex.js#L67
  // TODO: let @vitejs/plugin-react-refresh handle the transform
  // implement `include` option in @vitejs/plugin-react-refresh like this:
  // https://github.com/rollup/plugins/tree/master/packages/babel#include
  const result = transformSync(code, {
    plugins: [
      require('@babel/plugin-syntax-import-meta'),
      [require('react-refresh/babel'), { skipEnvCheck: true }],
    ],
    ast: true,
    sourceMaps: true,
    sourceFileName: id,
  })

  if (!/\$RefreshReg\$\(/.test(result.code)) {
    // no component detected in the file
    return code
  }

  const runtimePublicPath = '/@react-refresh'

  const header = `
import RefreshRuntime from "${runtimePublicPath}";

let prevRefreshReg;
let prevRefreshSig;

if (!window.__vite_plugin_react_preamble_installed__) {
throw new Error(
  "vite-plugin-react can't detect preamble." +
  "You should use vite-plugin-mdx along with @vitejs/plugin-react-refresh."
);
}

if (import.meta.hot) {
prevRefreshReg = window.$RefreshReg$;
prevRefreshSig = window.$RefreshSig$;
window.$RefreshReg$ = (type, id) => {
  RefreshRuntime.register(type, ${JSON.stringify(id)} + " " + id)
};
window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}`.replace(/[\n]+/gm, '')

  const footer = `
if (import.meta.hot) {
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

${isRefreshBoundary(result.ast) ? `import.meta.hot.accept();` : ``}
if (!window.__vite_plugin_react_timeout) {
  window.__vite_plugin_react_timeout = setTimeout(() => {
    window.__vite_plugin_react_timeout = 0;
    RefreshRuntime.performReactRefresh();
  }, 30);
}
}`

  return `${header}${result.code}${footer}`
}

/**
 * @param {import('@babel/core').BabelFileResult['ast']} ast
 */
function isRefreshBoundary(ast: any) {
  // Every export must be a React component.
  return ast.program.body.every((node: any) => {
    if (node.type !== 'ExportNamedDeclaration') {
      return true
    }
    const { declaration, specifiers } = node
    if (declaration && declaration.type === 'VariableDeclaration') {
      return declaration.declarations.every(
        ({ id }: any) => id.type === 'Identifier' && isComponentishName(id.name)
      )
    }
    return specifiers.every(
      ({ exported }: any) =>
        exported.type === 'Identifier' && isComponentishName(exported.name)
    )
  })
}

/**
 * @param {string} name
 */
function isComponentishName(name: any) {
  return typeof name === 'string' && name[0] >= 'A' && name[0] <= 'Z'
}
