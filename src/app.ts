import { APP_NAME, runtimeInfo } from '@/config/runtime'
import type { GreetingOptions } from '@/modules/greeting'
import { greet } from '@/modules/greeting'

/**
 * Application behavior. A plain async function instead of a server: this
 * template is a Node.js + TypeScript environment, not an HTTP service.
 * Returns the greeting so callers (and tests) can inspect the result.
 */
export async function run(): Promise<string> {
  const options: GreetingOptions = { punctuation: '!' }
  const message = greet(APP_NAME, options)

  console.log(message)
  console.log(runtimeInfo())

  return message
}
