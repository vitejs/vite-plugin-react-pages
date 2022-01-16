import React from 'react'
import CodeBlock from '../MDX/CodeBlock'

export interface Props {
  syntax: string
  text: string
}

export function FileText({ syntax, text }: Props) {
  if (typeof text !== 'string') {
    return (
      <pre>{`FileText Error: <FileText> component receives invalid props.
If you use it in jsx, you should import text with "import text from './path/to/file.ts?raw'" and use it like "<FileText text={text} syntax="ts" />"
If you use it in markdown, you should use it exactly like "<FileText src="./file.ts" syntax="tsx" />" (we use simple regexp to parse it, so you should use this format strictly)
`}</pre>
    )
  }
  return <CodeBlock className={`language-${syntax}`} children={text} />
}
