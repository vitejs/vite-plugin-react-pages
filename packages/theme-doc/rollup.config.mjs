import postcss from 'rollup-plugin-postcss'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import MagicString from 'magic-string'

const extensions = ['.js', '.jsx', '.ts', '.tsx']

export default {
  input: {
    index: 'src/index.tsx',
    ssrPlugin: 'src/ssrPlugin.tsx'
  },
  output: [
    {
      dir: 'dist',
      format: 'esm',
      sourcemap: true,
    },
  ],
  external: [
    'react',
    'react-dom',
    'react-router-dom',
    'vite-plugin-react-pages',
    '@mdx-js/react',
  ],
  plugins: [
    resolve({
      // prevent bundling unexpected deps
      // resolveOnly: ['antd', /^antd\/.*$/, '@babel/runtime'],
      // resolveOnly: ['none!'],
      extensions,
    }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      extensions,
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              chrome: '90',
              node: '12',
            },
          },
        ],
        '@babel/preset-typescript',
        '@babel/preset-react',
      ],
      plugins: [],
      configFile: false,
    }),
    postcss({
      config: false,
      use: {
        less: {
          javascriptEnabled: true,
        },
      },
      modules: {
        generateScopedName: `vp-local-[local]`,
      },
      extract: 'index.css',
    }),
    {
      name: 'add-css-import',
      async renderChunk(code, chunk, options, meta) {
        debugger
        if (chunk.fileName === 'index.js' && chunk.isEntry) {
          chunk.imports.push('./index.css')
          chunk.importedBindings['./index.css'] = []
          const s = new MagicString(code)
          s.prepend(`import './index.css';\n`)
          const map = s.generateMap({ hires: true })
          return {
            code: s.toString(),
            map,
          }
        }
      },
    },
  ],
}
