import { registerSSRPlugin } from 'vite-plugin-react-pages/client'
import { isSSR } from './utils'

if (isSSR) {
  registerSSRPlugin(import('./ssrPlugin').then((mod) => mod.default))
}
