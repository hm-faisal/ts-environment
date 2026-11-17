/**
 * Small utilities built on native Node.js APIs only. Demonstrates how the
 * strict options behave: `noUncheckedIndexedAccess` makes indexed reads
 * possibly-undefined, and `exactOptionalPropertyTypes` keeps optional
 * properties free of implicit `undefined`.
 */

/** Human-readable application name. */
export const APP_NAME = 'typescript-node-app'

/** Primary Node.js version segment, e.g. `26` for v26.13.1. */
export function nodeMajorVersion(): string {
  const [major] = process.versions.node.split('.')
  return major ?? 'unknown'
}

/** One-line description of the runtime environment. */
export function runtimeInfo(): string {
  return `Node.js v${process.versions.node} (ESM, TypeScript, major=${nodeMajorVersion()})`
}
