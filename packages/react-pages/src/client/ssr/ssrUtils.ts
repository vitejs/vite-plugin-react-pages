export let __callbacksRunBeforeSSR: any[] = []

export function runBeforeSSR(cb: (ctx: any) => void) {
  if (import.meta.env.SSR) {
    __callbacksRunBeforeSSR.push(cb)
  }
}
