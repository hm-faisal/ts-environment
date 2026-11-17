/** Options controlling how a greeting is rendered. */
export interface GreetingOptions {
  /**
   * Trailing punctuation. Under `exactOptionalPropertyTypes` this property
   * may be omitted, but it may never be explicitly `undefined`.
   */
  punctuation?: string
}

/** Build a simple greeting for `recipient`. */
export function greet(recipient: string, options: GreetingOptions = {}): string {
  const punctuation = options.punctuation ?? '!'
  return `Hello, ${recipient}${punctuation}`
}
