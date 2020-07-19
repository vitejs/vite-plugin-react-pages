import * as path from 'path'
import typescript from '@rollup/plugin-typescript'
import postcss from 'rollup-plugin-postcss'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'

export default {
  input: 'src/index.tsx',
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
  },
  plugins: [
    typescript(),
    commonjs(),
    resolve({
      resolveOnly: ['prism-react-renderer'],
    }),
    postcss({
      extract: path.resolve(__dirname, 'dist', 'index.css'),
      modules: true,
    }),
  ],
}
