import type { Plugin } from 'vite'
import remarkFrontmatter from 'remark-frontmatter'
import { transformMdx } from './transform'

export function cleanCreatePlugin(mdxOpts?: any) {
  return {
    transforms: [
      {
        test({ path }) {
          if (/\.mdx?$/.test(path)) {
            return true
          }
          return false
        },
        async transform({ code, isBuild, path }) {
          const forHMR = !(
            isBuild ||
            path.startsWith(`/@modules/`) ||
            process.env.NODE_ENV === 'production'
          )
          return transformMdx({ code, mdxOpts, forHMR, path })
        },
      },
    ],
  } as Plugin
}

export default function createPlugin(_mdxOpts?: any) {
  let remarkPlugins: any[] = _mdxOpts?.remarkPlugins ?? []
  // support frontmatter by default
  remarkPlugins = [remarkFrontmatter, ...remarkPlugins]
  return cleanCreatePlugin({ ..._mdxOpts, remarkPlugins })
}

export { transformMdx }
