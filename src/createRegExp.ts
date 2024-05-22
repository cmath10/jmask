import type { Descriptor } from '@/types'

export default (mask: string, descriptors: Record<string, Descriptor>) => {
  const chunks = []

  let pattern = ''
  let recursion: { char: string, pattern: string } | null = null

  for (let i = 0, translation, char; i < mask.length; i++) {
    char = mask.charAt(i)
    translation = descriptors[char]

    if (translation) {
      pattern = String(translation.pattern).replace(/.$|^./g, '')

      if (translation.recursive) {
        chunks.push(char)
        recursion = { char, pattern }
      } else {
        chunks.push(!translation.optional && !translation.recursive ? pattern : (pattern + '?'))
      }
    } else {
      chunks.push(char.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'))
    }
  }

  let regex = chunks.join('')

  if (recursion) {
    regex = regex
      .replace(new RegExp('(' + recursion.char + '(.*' + recursion.char + ')?)'), '($1)?')
      .replace(new RegExp(recursion.char, 'g'), recursion.pattern)
  }

  return new RegExp(regex)
}
