import React from 'react'

import { MDXProvider } from '@mdx-js/react'

import CodeBlock from './CodeBlock'

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
  return (
    <MDXProvider components={components}>
      <div className="markdown-body">{children}</div>
    </MDXProvider>
  )
}

export default MDX
