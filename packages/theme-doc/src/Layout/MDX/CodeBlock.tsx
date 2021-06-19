import React from 'react'
import Highlight, { defaultProps } from 'prism-react-renderer'
import theme from 'prism-react-renderer/themes/github'
import type { Language } from 'prism-react-renderer'

// copied from https://mdxjs.com/guides/syntax-highlighting

interface Props {
  readonly className?: string
  readonly children?: string
  readonly style?: React.CSSProperties
}

const CodeBlock = ({
  children = '',
  className = '',
  style: propStyle,
}: Props) => {
  const language = className?.replace(/language-/, '') as Language
  return (
    <Highlight
      {...defaultProps}
      theme={theme}
      code={children.trim()}
      language={language}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          className={className}
          style={propStyle ? { ...style, ...propStyle } : style}
        >
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
