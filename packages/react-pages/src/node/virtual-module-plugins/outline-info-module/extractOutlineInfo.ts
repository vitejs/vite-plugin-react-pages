import { remark } from 'remark'
import remarkMdx from 'remark-mdx'
import frontmatter from 'remark-frontmatter'
import gfm from 'remark-gfm'
import { visit } from 'unist-util-visit'
import { toString } from 'mdast-util-to-string'
import Slugger from 'github-slugger'

const slugs = new Slugger()

// collect headings
// ref: https://github.com/syntax-tree/mdast-util-toc/blob/ba8f680a3cbcd96351febe2b73edb21598720945/lib/search.js#L67

export function extractOutlineInfo(md: string) {
  const ast = remark().use(frontmatter).use(gfm).use(remarkMdx).parse(md)

  slugs.reset()

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
