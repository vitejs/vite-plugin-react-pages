import postcss from 'rollup-plugin-postcss'
import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import { LessPluginRemoveAntdGlobalStyles } from 'less-plugin-remove-antd-global-styles'

const extensions = ['.js', '.jsx', '.ts', '.tsx']

export default {
  input: 'src/index.tsx',
  output: [
    {
      dir: 'dist',
      format: 'esm',
      sourcemap: true,
    },
    {
      dir: 'dist-cjs',
      format: 'cjs',
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
          plugins: [new LessPluginRemoveAntdGlobalStyles()],
        },
      } as any,
      modules: {
        generateScopedName: `vp-local-[local]`,
      },
      extract: 'index.css',
    }),
  ],
} as any
