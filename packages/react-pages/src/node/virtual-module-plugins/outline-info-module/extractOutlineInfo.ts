import type { Root } from 'remark-mdx'

// collect headings
// ref: https://github.com/syntax-tree/mdast-util-toc/blob/ba8f680a3cbcd96351febe2b73edb21598720945/lib/search.js#L67

export async function extractOutlineInfo(md: string) {
  const { remark } = await import('remark')
  const { default: remarkMdx } = await import('remark-mdx')
  const { default: frontmatter } = await import('remark-frontmatter')
  const { default: gfm } = await import('remark-gfm')
  const { visit } = await import('unist-util-visit')
  const { toString } = await import('mdast-util-to-string')
  const { default: Slugger } = await import('github-slugger')

  const ast: Root = remark().use(frontmatter).use(gfm).use(remarkMdx).parse(md)
  const slugs = new Slugger()
  const headings: { depth: number; text: string; id: string }[] = []

  visit(ast, 'heading', (node) => {
    const text = toString(node, { includeImageAlt: false })
    let id =
      node.data && node.data.hProperties && (node.data.hProperties as any).id
    id = slugs.slug(id || text)
    if (!id) return
    headings.push({ depth: node.depth, text, id })
  })

  // debugger
  return { ast, outline: headings }
}

// extractOutlineInfo(`
// # t1
// 123123
// ## t1.1
// 23412

// import ChildContent from './ChildContent';

// <ChildContent />

// # t2
// asd
// `)

export type OutlineItem = {
  depth: number
  text: string
  id: string
}
