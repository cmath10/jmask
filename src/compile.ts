import type { Descriptor } from '@/types'

const escape = (value: string) => value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')

export const OPTIONAL = 1
export const REPEAT = 2

export type Static = [0, string, string]

export type Slot = [1, string, string, RegExp, number, string?]

export type Part = Static | Slot

export const isStatic = (part: Part): part is Static => part[0] === 0

export const compile = (
  value: string,
  descriptors: Record<string, Descriptor>
): Part[] => {
  const parts: Part[] = []

  for (let i = 0; i < value.length; i++) {
    const char = value.charAt(i)
    const descriptor = descriptors[char]

    if (descriptor) {
      parts.push([
        1,
        char,
        descriptor.pattern.source,
        descriptor.pattern,
        (descriptor.optional ? OPTIONAL : 0) | (descriptor.recursive ? REPEAT : 0),
        descriptor.fallback,
      ])
      continue
    }

    parts.push([0, char, escape(char)])
  }

  return parts
}
