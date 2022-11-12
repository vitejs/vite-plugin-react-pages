import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'

const extensions = ['.js', '.jsx', '.ts', '.tsx']

/*
use rollup to build esm code that target nodejs (run in native esm mode)
instead of using tsc only
to avoid error like this:

[ERR_UNSUPPORTED_DIR_IMPORT]: Directory import '/path/to/vite-plugin-react-pages/packages/react-pages/dist/node-esm/page-strategy/DefaultPageStrategy' is not supported resolving ES modules imported from /path/to/vite-plugin-react-pages/packages/react-pages/dist/node-esm/index.js

It is more flexable to use a bundler to build code for nodejs platform because:
- it allows us to use directory import in source code
- we don't need to add `.js` extension in relative import
- we can bundle include some deps (currently we external all deps)
*/

export default [
  {
    input: 'src/node/index.ts',
    output: [
      {
        file: 'dist/node-esm/index.mjs',
        format: 'esm',
        sourcemap: true,
      },
    ],
    external: [],
    plugins: [...plugins()],
  },
  {
    input: 'src/node/index.ts',
    output: [
      {
        dir: 'dist/node-cjs',
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
    ],
    external: [],
    plugins: [
      ...plugins({
        // bundle esm-only packages if they can not be dynamically imported
        resolveOnly: (module) =>
          module.startsWith('unist-util-') || module.startsWith('mdast-util-'),
      }),
      {
        // keep dynamic import to import esm-only packages
        // https://rollupjs.org/guide/en/#renderdynamicimport
        name: 'vite-pages-esm-dynamic-import',
        resolveDynamicImport(specifier) {
          return false
        },
        renderDynamicImport({ targetModuleId }) {
          return {
            left: 'import(',
            right: ')',
          }
        },
      },
    ],
  },
]

function plugins({ resolveOnly } = {}) {
  return [
    resolve({
      // prevent bundling unexpected deps
      resolveOnly: resolveOnly || ['none!'],
      extensions,
    }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      extensions,
      presets: ['@babel/preset-typescript'],
      plugins: [],
      configFile: false,
    }),
  ]
}
