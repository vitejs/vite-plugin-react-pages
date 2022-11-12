import { resolve } from 'path'
import { fileURLToPath } from 'url'

export const PKG_ROOT = resolve(fileURLToPath(import.meta.url), '../../..')

export const CLIENT_PATH = resolve(PKG_ROOT, 'dist/client')
