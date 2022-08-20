import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'

const extensions = ['.js', '.jsx', '.ts', '.tsx']

/*
use rollup to bundle code targeted nodejs (native esm)
(instead of using tsc only)
to avoid error like this:

[ERR_UNSUPPORTED_DIR_IMPORT]: Directory import '/path/to/vite-plugin-react-pages/packages/react-pages/dist/node-esm/page-strategy/DefaultPageStrategy' is not supported resolving ES modules imported from /path/to/vite-plugin-react-pages/packages/react-pages/dist/node-esm/index.js

It is more flexable to use a bundler to build code for nodejs platform because:
- it allows us to use directory import in source code
- we don't need to add `.js` extension in relative import
- we can bundle include some deps (currently we external all deps)
*/

export default {
  input: 'src/node/index.ts',
  output: [
    {
      // dir: 'dist/node-esm',
      file: 'dist/node-esm/index.mjs',
      format: 'esm',
      sourcemap: true,
    },
    // {
    //   dir: 'dist-cjs',
    //   format: 'cjs',
    //   sourcemap: true,
    // },
  ],
  external: [],
  plugins: [
    resolve({
      // prevent bundling unexpected deps
      resolveOnly: ['none!'],
      extensions,
    }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      extensions,
      presets: [
        // [
        //   '@babel/preset-env',
        //   {
        //     targets: {
        //       chrome: '90',
        //       node: '12',
        //     },
        //   },
        // ],
        '@babel/preset-typescript',
      ],
      plugins: [],
      configFile: false,
    }),
  ],
}
