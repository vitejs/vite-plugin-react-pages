import { extract, parse } from 'jest-docblock'
import grayMatter from 'gray-matter'
import { File } from './PageStrategy'

export async function extractStaticData(
  file: File
): Promise<{ sourceType: string; [key: string]: any }> {
  const code = await file.read()
  switch (file.extname) {
    case 'md':
    case 'mdx':
      const { data: frontmatter } = grayMatter(code)
      const staticData: any = { ...frontmatter, sourceType: 'md' }
      if (staticData.title === undefined) {
        staticData.title = extractMarkdownTitle(code)
      }
      return staticData
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return { ...parse(extract(code)), sourceType: 'js' }
    default:
      throw new Error(`unexpected extension name "${file.extname}"`)
  }
}

/**
 * track how many works are pending
 * to avoid returning half-finished page data
 */
export class PendingList {
  private pendingCount = 0
  private subscribers: Array<() => void> = []

  addPending(p: Promise<void>) {
    this.pendingCount++
    p.finally(() => {
      this.pendingCount--
      if (this.pendingCount === 0) {
        // all pending works are finished
        this.subscribers.forEach((notify) => notify())
        this.subscribers.length = 0
      }
    })
  }

  subscribe(): Promise<void> {
    if (this.pendingCount === 0) return Promise.resolve()
    return new Promise((res) => {
      this.subscribers.push(() => {
        res()
      })
    })
  }
}

function extractMarkdownTitle(code: string) {
  const match = code.match(/^# (.*)$/m)
  return match?.[1]
}

// theoretically, PendingTaskCounter can implement VolatileTask interface
// (the whole PendingTaskCounter is a busy task when count > 0)
// but currently it is not needed
export class PendingTaskCounter {
  private count = 0
  private callbacks: (() => void)[] = []

  public countTask() {
    this.count++
    let ended = false
    return () => {
      if (ended) return
      ended = true
      this.count--
      if (this.count === 0) {
        this.callbacks.forEach((cb) => cb())
        this.callbacks.length = 0
      }
    }
  }

  public callOnceWhenEmpty(cb: () => void) {
    if (this.count === 0) {
      cb()
    } else {
      this.callbacks.push(cb)
    }
  }

  public countVolatileTask(volatileTaskState: VolatileTaskState) {
    let stopCounting: undefined | (() => void)
    volatileTaskState.onStateChange((isBusy) => {
      if (isBusy) {
        // if this task is already counting, don't count again
        if (stopCounting) return
        stopCounting = this.countTask()
      } else {
        stopCounting?.()
      }
    })
  }
}

/**
 * VolatileTask has state that change between "busy" and "free"
 */
export interface VolatileTaskState {
  onStateChange: (cb: (isBusy: boolean) => void) => void
}
