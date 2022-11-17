import React from 'react'
import * as _cjsExports from 'prism-react-renderer'
const { default: Highlight, defaultProps } = commonjsExportsInterop(_cjsExports)
import theme from 'prism-react-renderer/themes/github/index.cjs'
import type { Language } from 'prism-react-renderer'
import { useCopyToClipBoard } from './useCopyToClipBoard'
import s from './CodeBlock.module.less'
import { commonjsExportsInterop } from '../../utils'

// copied from https://mdxjs.com/guides/syntax-highlighting

interface Props {
  readonly className?: `language-${Language}` | '' | string
  readonly style?: React.CSSProperties
}

const CodeBlock = ({
  children = '',
  className = '',
  style: propStyle,
}: React.PropsWithChildren<Props>) => {
  // with ```language\n``` md syntax, mdx will pass language in className
  const language = className?.replace(/language-/, '') as Language

  const { hasCopied, copyToClipBoard } = useCopyToClipBoard()

  if (typeof children !== 'string')
    throw new Error('unexpected children of CodeBlock: should be string')

  return (
    <Highlight
      {...defaultProps}
      theme={theme}
      code={children.trim()}
      language={language}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={`${className} ${s.pre}`}
          style={propStyle ? { ...style, ...propStyle } : style}
        >
          <button
            className={`${s.copy} ${hasCopied ? s.copied : ''}`}
            onClick={() => copyToClipBoard(children)}
          ></button>

          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  )
}

export default CodeBlock
