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
    '@mdx-js/react',
    'vite-plugin-react-pages',
    // /babel-runtime/
  ],
  plugins: [
    resolve({
      // resolveOnly: [
      //   'prism-react-renderer',
      //   '@alifd/next',
      //   // '@babel/runtime',
      //   // 'babel-runtime',
      // ],
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
      config: false,
      use: {
        sass: {
          data: `$css-prefix: "vp-theme-";`,
        },
      },
      extract: path.resolve(__dirname, 'dist', 'index.css'),
    }),
  ],
}
