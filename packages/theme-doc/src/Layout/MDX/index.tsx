import React, { useContext, useMemo, useState } from 'react'
import { MDXProvider } from '@mdx-js/react'
import { Link } from 'react-router-dom'
import type { MDXComponents } from 'mdx/types'

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

const components: MDXComponents = {
  pre: (props: any) => {
    // `pre` tag will be rendered by the nested `code` Component
    return (
      <isInsidePreContext.Provider value={true}>
        {props.children}
      </isInsidePreContext.Provider>
    )
  },
  code: withMdClassName((props: any) => {
    const isInsidePre = useContext(isInsidePreContext)
    if (isInsidePre) {
      // this is rendered from triple backquote blocks
      return <CodeBlock {...props} />
    }
    // this is rendered from single backquote
    return <code {...props} />
  }),
  CodeBlock,
  Demo,
  TsInfo,
  FileText,
  a: (props: React.HTMLProps<HTMLAnchorElement>) => {
    const { href, ...rest } = props
    if (href?.startsWith('/')) {
      return <Link {...(rest as any)} to={href} />
    }
    if (href?.startsWith('#')) {
      return (
        <Link
          {...(rest as any)}
          to={href}
          onClick={() => {
            AnchorLink.scrollToAnchor(href.substring(1))
          }}
        />
      )
    }
    return <a target="_blank" rel="noopener" {...props} />
  },
}

const MDX: React.FC<React.PropsWithChildren<any>> = ({ children }) => {
  const themeProps = useContext(themePropsCtx)

  const mdxComponents = useMemo(() => {
    return {
      ...components,
      h1: heading(1),
      h2: heading(2),
      h3: heading(3),
      h4: heading(4),
      h5: heading(5),
      h6: heading(6),
    }
    function heading(level: number) {
      const Tag = 'h' + level
      return function Heading(
        props: React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLHeadingElement>,
          HTMLDivElement
        >
      ) {
        const { id } = props
        if (id && typeof id === 'string') {
          return (
            <Tag {...props}>
              <AnchorLink className="anchor" to={`#${id}`}>
                <span className="octicon octicon-link"></span>
              </AnchorLink>
              {props.children}
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

function withMdClassName(Component: React.FC | string) {
  return function (props: any) {
    const { className } = props
    const newClassName = className ? `${className} markdown-el` : 'markdown-el'
    return <Component {...props} className={newClassName} />
  }
}
