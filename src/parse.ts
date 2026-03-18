import type {
  Descriptor,
  Invalid,
  Parsed,
} from '@/types'

export type Parse = (raw: string, skipMaskChars?: boolean) => Parsed

const put = (buffer: string[], char: string, reverse: boolean) => reverse
  ? buffer.unshift(char)
  : buffer.push(char)

export const parse = (
  raw: string,
  mask: string,
  descriptors: Record<string, Descriptor>,
  reverse = false,
  skipMaskChars = false
): Parsed => {
  const buffer: string[] = []
  const invalid: Invalid[] = []
  const maskCharsPositions: number[] = []
  const step = reverse ? -1 : 1
  const lastMaskIndex = reverse ? 0 : mask.length - 1

  let maskIndex = reverse ? mask.length - 1 : 0
  let valueIndex = reverse ? raw.length - 1 : 0
  let rewindIndex = -1
  let staticCharCount = 0
  let lastStaticMaskChar: string | undefined

  while (
    reverse ? maskIndex >= 0 && valueIndex >= 0 : maskIndex < mask.length && valueIndex < raw.length
  ) {
    const maskChar = mask.charAt(maskIndex)
    const valueChar = raw.charAt(valueIndex)
    const descriptor = descriptors[maskChar]

    if (descriptor) {
      if (valueChar.match(descriptor.pattern)) {
        put(buffer, valueChar, reverse)

        if (descriptor.recursive) {
          if (rewindIndex === -1) {
            rewindIndex = maskIndex
          } else if (rewindIndex !== lastMaskIndex && maskIndex === lastMaskIndex) {
            maskIndex = rewindIndex - step
          }

          if (rewindIndex === lastMaskIndex) {
            valueIndex += step
            continue
          }
        }

        maskIndex += step
      } else if (valueChar === lastStaticMaskChar) {
        staticCharCount--
        lastStaticMaskChar = undefined
      } else if (descriptor.optional) {
        maskIndex += step
        valueIndex -= step
      } else if (descriptor.fallback) {
        put(buffer, descriptor.fallback, reverse)
        maskIndex += step
        valueIndex += step
      } else {
        invalid.push({
          position: valueIndex,
          char: valueChar,
          pattern: descriptor.pattern,
        })
      }

      valueIndex += step
      continue
    }

    if (!skipMaskChars) {
      put(buffer, maskChar, reverse)
    }

    if (valueChar === maskChar) {
      maskCharsPositions.push(valueIndex)
      valueIndex += step
    } else {
      lastStaticMaskChar = maskChar
      maskCharsPositions.push(valueIndex + staticCharCount)
      staticCharCount++
    }

    maskIndex += step
  }

  const lastMaskChar = mask.charAt(lastMaskIndex)

  if (mask.length === raw.length + 1 && !descriptors[lastMaskChar]) {
    buffer.push(lastMaskChar)
  }

  const diff = reverse ? buffer.length - raw.length : 0
  const positions = maskCharsPositions.map(position => position + diff)

  return {
    value: buffer.join(''),
    map: reverse ? positions.reverse() : positions,
    invalid,
  }
}

export const createParser = (
  mask: string,
  descriptors: Record<string, Descriptor>,
  reverse = false
): Parse => {
  return (raw, skipMaskChars = false) => parse(raw, mask, descriptors, reverse, skipMaskChars)
}
