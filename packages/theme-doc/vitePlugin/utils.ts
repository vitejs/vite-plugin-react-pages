import { dirname } from 'path'
import { fileURLToPath } from 'url'

// Isomorphic __dirname working in both cjs and esm
// https://antfu.me/posts/publish-esm-and-cjs#context-misalignment
export const _dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : // @ts-ignore
      dirname(fileURLToPath(import.meta.url))
