import type {
  Invalid,
  Parsed,
} from '@/types'

import type {
  Part,
  Slot,
} from '@/compile'

import {
  OPTIONAL,
  REPEAT,
  isStatic,
} from '@/compile'

const put = (buffer: string[], char: string, reverse: boolean) => reverse
  ? buffer.unshift(char)
  : buffer.push(char)

export type Parse = (raw: string, skipMaskChars?: boolean) => Parsed

export const parse = (
  raw: string,
  parts: Part[],
  reverse = false,
  skipMaskChars = false
): Parsed => {
  const buffer: string[] = []
  const invalid: Invalid[] = []
  const map: number[] = []
  const step = reverse ? -1 : 1
  const last = reverse ? 0 : parts.length - 1

  let idx = reverse ? parts.length - 1 : 0
  let pos = reverse ? raw.length - 1 : 0
  let rewind = -1
  let extra = 0
  let lastStatic: string | undefined

  while (reverse ? idx >= 0 && pos >= 0 : idx < parts.length && pos < raw.length) {
    const part = parts[idx]
    const char = raw.charAt(pos)

    if (!isStatic(part)) {
      const pattern = part[3]
      const flags = part[4]
      const fallback = part[5]
      const repeat = flags & REPEAT

      if (char.match(pattern)) {
        put(buffer, char, reverse)

        if (repeat) {
          if (rewind === -1) {
            rewind = idx
          }

          if (rewind === last) {
            pos += step
            continue
          }

          if (idx === last) {
            idx = rewind - step
          }
        }

        idx += step
        pos += step
        continue
      }

      if (char === lastStatic) {
        extra--
        lastStatic = undefined
        pos += step
        continue
      }

      if (flags & OPTIONAL) {
        idx += step
        continue
      }

      if (fallback) {
        put(buffer, fallback, reverse)
        idx += step
        pos += step * 2
        continue
      }

      invalid.push({
        position: pos,
        char,
        pattern,
      })

      pos += step
      continue
    }

    const partChar = part[1]

    if (!skipMaskChars) {
      put(buffer, partChar, reverse)
    }

    if (char === partChar) {
      map.push(pos)
      pos += step
    } else {
      lastStatic = partChar
      map.push(pos + extra)
      extra++
    }

    idx += step
  }

  const tail = parts[last]

  if (parts.length === raw.length + 1 && tail && isStatic(tail)) {
    buffer.push(tail[1])
  }

  const diff = reverse ? buffer.length - raw.length : 0
  const positions = map.map(position => position + diff)

  return {
    value: buffer.join(''),
    map: reverse ? positions.reverse() : positions,
    invalid,
  }
}

export const createParser = (
  parts: Part[],
  reverse = false
): Parse => {
  return (raw, skipMaskChars = false) => parse(raw, parts, reverse, skipMaskChars)
}

export const createRegExp = (parts: Part[]) => {
  const chunks = []
  let repeat: Slot | null = null

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]

    if (isStatic(part)) {
      chunks.push(part[2])
      continue
    }

    if (part[4] & REPEAT) {
      chunks.push(part[1])
      repeat = part
    } else {
      chunks.push(part[4] & OPTIONAL ? `${part[2]}?` : part[2])
    }
  }

  let regex = chunks.join('')

  if (repeat) {
    regex = regex
      .replace(new RegExp(`(${repeat[1]}(.*${repeat[1]})?)`), '($1)?')
      .replace(new RegExp(repeat[1], 'g'), repeat[2])
  }

  return new RegExp(regex)
}
