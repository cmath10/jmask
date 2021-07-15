/**
 * @param {string} mask
 * @param {Record<string, JMaskTranslation>} translations
 */
export default (mask, translations) => {
  const chunks = []

  let pattern
  let recursion
  let regex

  for (let i = 0, translation, char; i < mask.length; i++) {
    char = mask.charAt(i)
    translation = translations[char]

    if (translation) {
      pattern = translation.pattern.toString().replace(/.{1}$|^.{1}/g, '')

      if (translation.recursive) {
        chunks.push(char)
        recursion = { char, pattern }
      } else {
        chunks.push(!translation.optional && !translation.recursive ? pattern : (pattern + '?'))
      }

    } else {
      chunks.push(char.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
    }
  }

  regex = chunks.join('')

  if (recursion) {
    regex = regex
      .replace(new RegExp('(' + recursion.char + '(.*' + recursion.char + ')?)'), '($1)?')
      .replace(new RegExp(recursion.char, 'g'), recursion.pattern)
  }

  return new RegExp(regex)
}
