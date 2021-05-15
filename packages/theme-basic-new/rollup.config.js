import * as path from 'path'
import postcss from 'rollup-plugin-postcss'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'

const extensions = ['.js', '.jsx', '.ts', '.tsx']

export default {
  input: 'src/index.tsx',
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
  },
  external: [
    'react',
    'react-dom',
    'react-router-dom',
    'vite-plugin-react-pages',
    'vite-plugin-react-pages/client',
    './index.css',
  ],
  plugins: [
    resolve({
      // prevent bundling unexpected deps
      // resolveOnly: ['antd', /^antd\/.*$/, '@babel/runtime'],
      extensions,
    }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      extensions,
      presets: ['@babel/preset-typescript', '@babel/preset-react'],
      plugins: [
        [
          'babel-plugin-import',
          {
            libraryName: 'antd',
            libraryDirectory: 'es',
            style: true,
          },
        ],
      ],
      configFile: false,
    }),
    postcss({
      config: false,
      use: {
        less: {
          modifyVars: {
            'ant-prefix': 'vp-antd',
          },
          javascriptEnabled: true,
        },
      },
      modules: {
        generateScopedName: `vp-local-[local]`,
      },
      extract: path.resolve(__dirname, 'dist', 'index.css'),
    }),
  ],
}
