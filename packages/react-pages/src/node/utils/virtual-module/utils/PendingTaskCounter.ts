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

  /**
   * the callback style is preferred over the promise style
   * because cb will be called **synchronously** when count turn 0
   * while promise-then-cb would be called in next microtask (at that time the state may have changed)
   */
  public callOnceWhenIdle(cb: () => void) {
    if (this.count === 0) {
      cb()
    } else {
      this.callbacks.push(cb)
    }
  }

  /** track a changeable pending state */
  public countPendingState(pendingState: PendingState) {
    let stopCounting: undefined | (() => void)
    pendingState.onStateChange((isPending) => {
      if (isPending) {
        // if this task has already been counted, don't count again
        if (stopCounting) return
        stopCounting = this.countTask()
      } else {
        stopCounting?.()
        stopCounting = undefined
      }
    })
  }
}

export class PendingState {
  private _isPending = false
  get isPending() {
    return this._isPending
  }
  set isPending(value: boolean) {
    if (this._isPending === value) return
    this._isPending = value
    this.cbs.forEach((cb) => cb(value))
  }

  private cbs: Array<(isPending: boolean) => void> = []
  onStateChange(cb: (isPending: boolean) => void) {
    this.cbs.push(cb)
    return () => {
      this.cbs = this.cbs.filter((v) => v !== cb)
    }
  }
}
