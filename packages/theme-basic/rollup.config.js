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
  plugins: [
    resolve({
      resolveOnly: ['prism-react-renderer', '@alifd/next'],
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
            libraryName: '@alifd/next',
            libraryDirectory: 'es',
            style: true,
          },
        ],
      ],
      configFile: false,
    }),
    postcss({
      extract: path.resolve(__dirname, 'dist', 'index.css'),
    }),
  ],
}
