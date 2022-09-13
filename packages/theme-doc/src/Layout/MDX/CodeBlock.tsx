import React from 'react'
import Highlight, { defaultProps } from 'prism-react-renderer'
import theme from 'prism-react-renderer/themes/github'
import type { Language } from 'prism-react-renderer'
import { useCopyToClipBoard } from './useCopyToClipBoard'
import s from './CodeBlock.module.less'

// copied from https://mdxjs.com/guides/syntax-highlighting

interface Props {
  readonly className?: `language-${Language}` | ''
  readonly children?: string
  readonly style?: React.CSSProperties
}

const CodeBlock = ({
  children = '',
  className = '',
  style: propStyle,
}: Props) => {
  // with ```language\n``` md syntax, mdx will pass language in className
  const language = className?.replace(/language-/, '') as Language

  const { hasCopied, copyToClipBoard } = useCopyToClipBoard()

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
