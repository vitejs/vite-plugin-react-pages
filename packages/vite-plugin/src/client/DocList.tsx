import React, { useEffect, useState } from 'react'

const DocList: React.FC = () => {
  const data = useDocList()
  if (!data) return <p>Loading...</p>
  const { pages } = data
  if (!Array.isArray(pages) || pages.length === 0)
    return (
      <p>
        No <code>*.md|mdx</code> file is found.
      </p>
    )
  return (
    <ul>
      {pages.map((filePath) => {
        return (
          <li key={filePath}>
            <a href={`workspace/${filePath}`}>{filePath}</a>
          </li>
        )
      })}
    </ul>
  )
}

export default DocList

function useDocList() {
  const [data, setData] = useState<any>(null)
  useEffect(() => {
    ;(async () => {
      const response = await fetch('/api/pages')
      setData(await response.json())
    })()
  }, [])
  return data
}
