import React from 'react'

import { MDXProvider } from '@mdx-js/react'

import CodeBlock from './CodeBlock'

const components = {
  pre: (props: any) => <div {...props} />,
  code: CodeBlock,
}

interface IProps {}

const MDX: React.FC<IProps> = ({ children }) => {
  return <MDXProvider components={components}>{children}</MDXProvider>
}

export default MDX
