import React, { useContext, useMemo } from 'react'
import GithubSlugger from 'github-slugger'
import { MDXProvider } from '@mdx-js/react'

import CodeBlock from './CodeBlock'
import { themePropsCtx } from '../../ctx'

const components = {
  pre: (
    props: React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >
  ) => <div {...props} />,
  code: CodeBlock,
}

const MDX: React.FC = ({ children }) => {
  const themeProps = useContext(themePropsCtx)

  const mdxComponents = useMemo(() => {
    // reset slugger state for each page
    const slugger = new GithubSlugger()
    return {
      ...components,
      h2: heading(2),
      h3: heading(3),
      h4: heading(4),
      h5: heading(5),
    }
    function heading(level: number) {
      const Tag = 'h' + level
      return function Heading(
        props: React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLHeadingElement>,
          HTMLDivElement
        >
      ) {
        const title = props.children
        if (typeof title === 'string') {
          const id = slugger.slug(title)
          return (
            <Tag {...props}>
              <a id={id} className="anchor" href={`#${id}`}>
                <span className="octicon octicon-link"></span>
              </a>
              {title}
            </Tag>
          )
        }
        return <Tag {...props} />
      }
    }
  }, [themeProps.loadState.routePath])

  return (
    <MDXProvider components={mdxComponents}>
      <div className="markdown-body">{children}</div>
    </MDXProvider>
  )
}

export default MDX
