import type { Plugin } from 'vite'
import remarkFrontmatter from 'remark-frontmatter'
import { transformMdx } from './transform'

export function cleanCreatePlugin(mdxOpts?: any): Plugin {
  let shouldApplyHMR = true

  return {
    name: 'vite-plugin-mdx',
    // enforce: 'pre',
    config() {
      return {
        transformInclude: /\.mdx?$/,
      }
    },
    configResolved(config) {
      if (config.command === 'build' || config.isProduction) {
        shouldApplyHMR = false
      }
    },
    transform(code: string, id: string) {
      if (!/\.mdx?$/.test(id)) {
        return
      }

      return transformMdx({ code, mdxOpts, forHMR: shouldApplyHMR, id })
    },
  }
}

export default function createPlugin(_mdxOpts?: any) {
  let remarkPlugins: any[] = _mdxOpts?.remarkPlugins ?? []
  // support frontmatter by default
  remarkPlugins = [remarkFrontmatter, ...remarkPlugins]
  return cleanCreatePlugin({ ..._mdxOpts, remarkPlugins })
}

export { transformMdx }
