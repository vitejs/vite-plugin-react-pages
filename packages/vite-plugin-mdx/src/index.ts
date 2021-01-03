import type { Plugin } from 'vite'
import remarkFrontmatter from 'remark-frontmatter'
import { transformMdx } from './transform'

export function cleanCreatePlugin(mdxOpts?: any): Plugin {
  let shouldApplyHMR = true

  return {
    name: 'vite-plugin-mdx',
    // enforce: 'pre',
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
    handleHotUpdate(ctx) {
      // TODO: there are two modules for same mdx file in ctx.modules:
      // xxx.mdx?import and xxx.mdx .
      // It may be a bug of vite
      debugger;
      // return ctx.modules.filter((mod) => {
      //   return mod.importers.size > 0
      // })
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
