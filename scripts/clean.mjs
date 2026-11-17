// Cross-platform "clean" helper: removes generated build output.
import { rmSync } from 'node:fs'

rmSync(new URL('../dist', import.meta.url), { recursive: true, force: true })
