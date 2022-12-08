import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'

const extensions = ['.js', '.jsx', '.ts', '.tsx']

/*
bundle client modules to reduce browser request during dev
also prevent conflict npm packages with users (like jotai)
*/

export default {
  input: [
    'src/client/entries/csr.tsx',
    'src/client/entries/ssg-client.tsx',
    'src/client/entries/ssg-server.tsx',
  ],
  output: {
    dir: 'dist/client-bundles/entries',
    entryFileNames: `[name].mjs`,
    format: 'esm',
    sourcemap: true,
  },
  external: [],
  plugins: [
    {
      name: 'client-external',
      resolveId(source, importer) {
        if (source.startsWith('/@react-pages/')) {
          return {
            id: source,
            external: 'absolute',
          }
        }
      },
    },
    resolve({
      // prevent bundling unexpected deps
      resolveOnly: ['jotai'],
      extensions,
    }),
    commonjs(),
    babel({
      babelHelpers: 'bundled',
      extensions,
      presets: [
        '@babel/preset-typescript',
        ['@babel/preset-react', { runtime: 'automatic' }],
      ],
      plugins: [],
      configFile: false,
    }),
  ],
}
