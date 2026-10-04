/**
 * Estimate reading time for a given text body.
 * Count Han characters separately so unspaced Chinese is not treated as one word.
 * Two Han characters count as one word-equivalent (400 characters/min at 200 wpm).
 *
 * @param body - Raw text content (Markdown/MDX source)
 * @param wpm  - Reading speed in words per minute (default: 200)
 * @returns Estimated reading time in minutes (minimum 1)
 */
export function readingTime(body: string, wpm = 200): number {
  const hanCharacters = body.match(/\p{Script=Han}/gu)?.length ?? 0;
  const otherWords = body.replace(/\p{Script=Han}/gu, ' ').match(/[^\s\p{P}\p{S}]+/gu)?.length ?? 0;
  return Math.max(1, Math.ceil((otherWords + hanCharacters / 2) / wpm));
}
