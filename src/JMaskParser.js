const put = (buffer, char, reverse) => reverse ? buffer.unshift(char) : buffer.push(char)

const conveyor = (value, reverse) => {
  const _offset = reverse ? -1 : 1
  let _position = reverse ? value.length - 1 : 0

  return {
    forward: () => { _position += _offset },
    back: () => { _position -= _offset },
    char: () => value.charAt(_position),
    last: () => reverse ? 0 : value.length - 1,
    getPosition: () => _position,
    setPosition: position => { _position = position },
    on: position => _position === position,
    offset: () => _offset,
    ended: () => reverse ? _position <= -1 : _position >= value.length,
  }
}

export default class JMaskParser {
  /**
   * @param {string} mask
   * @param {Record<string, JMaskTranslation>} translations
   * @param {boolean} [reverse]
   */
  constructor (mask, translations, reverse) {
    this.mask = mask
    this.reverse = reverse
    this.translations = translations
  }

  /**
   * @param {string} raw
   * @param {boolean} [skipMaskChars]
   * @returns {{invalid: *, value: *, map: (*)}}
   */
  parse (raw, skipMaskChars) {
    const buffer = []
    const reverse = this.reverse
    const invalid = []

    const mask = conveyor(this.mask, this.reverse)
    const value = conveyor(raw, this.reverse)

    let rewindPosition = -1
    let charCount = 0
    let charPositions = [] // Mask char positions in input string

    let lastUntranslated = undefined

    while (!mask.ended() && !value.ended()) {
      let translation = this.translations[mask.char()]

      if (translation) {
        if (value.char().match(translation.pattern)) {
          put(buffer, value.char(), reverse)

          if (translation.recursive) {
            if (rewindPosition === -1) {
              rewindPosition = mask.getPosition()
            } else if (rewindPosition !== mask.last() && mask.on(mask.last())) {
              mask.setPosition(rewindPosition - mask.offset())
            }

            if (rewindPosition === mask.last()) {
              continue
            }
          }

          mask.forward()
        } else if (value.char() === lastUntranslated) {
          // matched the last untranslated (raw) mask character that we encountered
          // likely an insert offset the mask character from the last entry; fall
          // through and only increment v
          charCount--
          lastUntranslated = undefined
        } else if (translation.optional) {
          mask.forward()
          value.back()
        } else if ('fallback' in translation) {
          put(buffer, translation.fallback, reverse)
          mask.forward()
          value.back()
        } else {
          invalid.push({
            position: value.getPosition(),
            char: value.char(),
            pattern: translation.pattern,
          })
        }

        value.forward()
      } else {
        if (!skipMaskChars) {
          put(buffer, mask.char(), reverse)
        }

        if (value.char() === mask.char()) {
          charPositions.push(value.getPosition())
          value.forward()
        } else {
          lastUntranslated = mask.char()
          charPositions.push(value.getPosition() + charCount)
          charCount++
        }

        mask.forward()
      }
    }

    const lastMaskChar = this.mask.charAt(mask.last())

    if (this.mask.length === raw.length + 1 && !this.translations[lastMaskChar]) {
      buffer.push(lastMaskChar)
    }

    const diff = reverse ? buffer.length - raw.length : 0
    const positions = charPositions.map(p => p + diff)

    return {
      value: buffer.join(''),
      map: reverse ? positions.reverse() : positions,
      invalid,
    }
  }
}
