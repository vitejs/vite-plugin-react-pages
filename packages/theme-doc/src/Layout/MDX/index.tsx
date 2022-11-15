import React, { useContext, useMemo, useState } from 'react'
import GithubSlugger from 'github-slugger'
import { MDXProvider } from '@mdx-js/react'
import { Link } from 'react-router-dom'

import CodeBlock from './CodeBlock'
import { themePropsCtx } from '../../ctx'
import { Demo } from '../Demo'
import { TsInfo } from '../TsInfo'
import { FileText } from '../FileText'
import AnchorLink from '../../components/AnchorLink'

/**
 * use isInsidePreContext to let the `code` Component
 * know that it is rendered from triple backquote blocks:
 * ```language
 * code content
 * ```
 * syntax, instead of single backquote: `code content`
 */
const isInsidePreContext = React.createContext(false)

const components = {
  pre: (props: any) => {
    // `pre` tag will be rendered by the nested `code` Component
    return (
      <isInsidePreContext.Provider value={true}>
        {props.children}
      </isInsidePreContext.Provider>
    )
  },
  code: (props: any) => {
    const isInsidePre = useContext(isInsidePreContext)
    if (isInsidePre) {
      // this is rendered from triple backquote blocks
      return <CodeBlock {...props} />
    }
    // this is rendered from single backquote
    return <code {...props} />
  },
  CodeBlock,
  Demo,
  TsInfo,
  FileText,
  a: (props: React.HTMLProps<HTMLAnchorElement>) => {
    const { href, ...rest } = props
    if (href?.startsWith('/')) {
      return <Link {...(rest as any)} to={href} />
    }
    return <a target="_blank" rel="noopener" {...props} />
  },
}

const MDX: React.FC<React.PropsWithChildren<any>> = ({ children }) => {
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
        const [idCache] = useState<Record<string, string>>({})
        const title = props.children
        if (typeof title === 'string') {
          if (!idCache[title]) idCache[title] = slugger.slug(title)
          const id = idCache[title]
          return (
            <Tag {...props}>
              <AnchorLink id={id} className="anchor" to={`#${id}`}>
                <span className="octicon octicon-link"></span>
              </AnchorLink>
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
