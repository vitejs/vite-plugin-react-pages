import { useState, useRef } from 'react'
import copy from 'copy-to-clipboard'

const useCopyToClipBoard = () => {
  const timer = useRef<any>()
  const [hasCopied, setHasCopied] = useState(false)

  // allow users to copy multiple times
  // in a short interval of time.
  const copyToClipBoard = (value: string) => {
    setHasCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setHasCopied(false)
      copy(value)
    }, 2 * 1000)
  }

  return {
    hasCopied,
    copyToClipBoard,
  }
}

export { useCopyToClipBoard }
