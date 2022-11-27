import React, { useState } from 'react'

import { Code } from './icons'
import CodeBlock from '../MDX/CodeBlock'

import s from './index.module.less'

interface Props {
  default: React.ComponentType<React.PropsWithChildren<unknown>>
  demoMeta: {
    code: string
    title?: string
    desc?: string
  }
  style?: React.CSSProperties
  className?: string
  isDemo: boolean
}

export function Demo({
  default: DemoComp,
  demoMeta,
  isDemo,
  style,
  className,
}: Props) {
  if (!DemoComp || !demoMeta || !isDemo) {
    return (
      <pre>{`Demo Error: <Demo> component receives invalid props.
If you use it in jsx, you should import demos like "import * as demoInfo from './demos/demo.tsx?demo'" and use it like "<Demo {...demoInfo}>"
If you use it in markdown, you should use it exactly like "<Demo src="./demos/demo1.tsx" />" (we use simple regexp to parse it, so you should use this format strictly)
`}</pre>
    )
  }
  const { code, title, desc } = demoMeta
  const [showCode, setShowCode] = useState(false)
  return (
    <div
      className={[s.demoBox, className].filter(Boolean).join(' ')}
      style={style}
    >
      <div className={s.demo}>
        <DemoComp />
      </div>

      <div className={s.meta}>
        {title && <div className={s.title}>{title}</div>}
        {desc && <div className={s.desc}>{desc}</div>}
      </div>

      <div className={s.actions}>
        <div
          className={s.action}
          onClick={() => {
            setShowCode((v) => !v)
          }}
        >
          <Code />
        </div>
      </div>

      {showCode && (
        <div className={s.code}>
          <div className={s.codeInner}>
            <CodeBlock
              className="language-tsx"
              style={{ background: 'transparent', overflow: 'visible' }}
            >
              {code}
            </CodeBlock>
          </div>
        </div>
      )}
    </div>
  )
}
