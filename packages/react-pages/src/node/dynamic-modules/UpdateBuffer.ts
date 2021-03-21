import { EventEmitter } from 'events'
import { debounce } from 'mini-debounce'

/**
 * Types of page data updates.
 *
 * add:
 *  the page list module will be updated.
 * update:
 *  the page list module will be updated.(because static data changed)
 *  the page data module will be updated.
 * delete:
 *  the page list module will be updated.
 *  buffered update of the deleted page will be cancled.
 *
 * TODO: seperate the updates of runtime data and static data
 * because updates of runtime data don't need to trigger the update of page list module,
 * and updates of static data don't need to trigger the update of page data module.
 */
type Update = {
  type: 'add' | 'update' | 'delete'
  pageId: string
}

export type ScheduleUpdate = (update: Update) => void

/**
 * Buffer page data updates.
 * Can flush a batch of updates together
 * and cancle unnecessary updates
 */
export class UpdateBuffer extends EventEmitter {
  /**
   * which pages should be updated
   */
  private pageUpdateBuffer = new Set<string>()

  /**
   * whether the page list should be updated
   */
  private pageListUpdateBuffer = false

  private scheduleFlush: () => void

  constructor() {
    super()
    this.scheduleFlush = debounce(() => {
      if (this.pageListUpdateBuffer) {
        this.emit('page-list')
        this.pageListUpdateBuffer = false
      }

      if (this.pageUpdateBuffer.size > 0) {
        const updates = [...this.pageUpdateBuffer.values()]
        this.emit('page', updates)
        this.pageUpdateBuffer.clear()
      }
    }, 100)
  }

  scheduleUpdate(update: Update) {
    switch (update.type) {
      case 'add':
        this.pageListUpdateBuffer = true
        break
      case 'update':
        this.pageListUpdateBuffer = true
        this.pageUpdateBuffer.add(update.pageId)
        break
      case 'delete':
        this.pageListUpdateBuffer = true
        this.pageUpdateBuffer.delete(update.pageId)
        break
      default:
        throw new Error(`invalid update type ${update.type}`)
    }
    this.scheduleFlush()
  }

  async batchUpdate(exec: (scheduleUpdate: ScheduleUpdate) => Promise<void>) {
    let updates: Update[] | null = []
    const _this = this

    try {
      await exec(scheduleUpdate)
    } finally {
      updates.forEach((update) => {
        _this.scheduleUpdate(update)
      })
      updates = null
      this.scheduleFlush()
    }

    function scheduleUpdate(update: Update) {
      if (!updates) {
        // the batch lifetime has already expired
        // add it to buffer directly
        _this.scheduleUpdate(update)
        return
      }
      // store it, will flust these updates together later
      updates.push(update)
    }
  }
}
