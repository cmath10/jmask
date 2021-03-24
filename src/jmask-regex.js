import { translations as defaultTranslations } from './jmask-defaults'

class JMaskRegex {
  /**
   * @param {string} mask
   * @param {object} [translations]
   */
  constructor (mask, translations) {
    this.mask = mask
    this.translations = Object.assign({}, translations || {}, defaultTranslations)
  }

  /**
   * @param {string} value
   */
  test (value) {
    return this.regex.test(value)
  }

  get regex () {
    const chunks = []

    let pattern
    let optional
    let recursive
    let recursiveOptions
    let regex

    for (let i = 0, translation, char; i < this.length; i++) {
      char = this.char(i)
      translation = this.translations[char]

      if (translation) {

        pattern = translation.pattern.toString().replace(/.{1}$|^.{1}/g, '')
        optional = translation.optional
        recursive = translation.recursive

        if (recursive) {
          chunks.push(char)
          recursiveOptions = {char, pattern}
        } else {
          chunks.push(!optional && !recursive ? pattern : (pattern + '?'))
        }

      } else {
        chunks.push(char.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'))
      }
    }

    regex = chunks.join('')

    if (recursiveOptions) {
      regex = regex
        .replace(new RegExp('(' + recursiveOptions.char + '(.*' + recursiveOptions.char + ')?)'), '($1)?')
        .replace(new RegExp(recursiveOptions.char, 'g'), recursiveOptions.pattern)
    }

    return new RegExp(regex)
  }

  get length () {
    return this.mask.length
  }

  /**
   * @param i
   * @returns {string}
   */
  char (i) {
    return this.mask.charAt(i)
  }
}

export default JMaskRegex
