import JMaskBuffer from './jmask-buffer';
import JMaskConveyor from './jmask-conveyor';
import { translations as defaultTranslations } from './jmask-defaults';

class JmaskParser {
  /**
   * @param {string} mask
   * @param {Object} [options]
   */
  constructor (mask, options) {
    options = options || {};

    this.mask = mask;
    this.reverse = options.reverse || false;
    this.translations = Object.assign({}, options.translations || {}, defaultTranslations);

    this.invalid = [];
  }

  /**
   * @param {string} value
   * @param {boolean} [skipMaskChars]
   * @returns {{buffer: *, map}}
   */
  parse (value, skipMaskChars) {
    const buffer = new JMaskBuffer(this.reverse);
    const invalid = [];

    const m = new JMaskConveyor(this.mask, this.reverse);
    const v = new JMaskConveyor(value, this.reverse);

    let resetPosition = -1;
    let charCount = 0;
    let charPositions = []; // Mask char positions in input string

    let lastUntranslated = undefined;

    while (!m.finished && !v.finished) {
      let translation = this.translations[m.char];

      if (translation) {
        if (v.char.match(translation.pattern)) {
          buffer.add(v.char);

          if (translation.recursive) {
            if (resetPosition === -1) {
              resetPosition = m.position;
            } else if (m.position === m.last && m.position !== resetPosition) {
              m.position = resetPosition - m.offset;
            }

            if (resetPosition === m.last) {
              m.back();
            }
          }

          m.forward();
        } else if (v.char === lastUntranslated) {
          // matched the last untranslated (raw) mask character that we encountered
          // likely an insert offset the mask character from the last entry; fall
          // through and only increment v
          charCount--;
          lastUntranslated = undefined;
        } else if (translation.optional) {
          m.forward();
          v.back();
        } else if ('fallback' in translation) {
          buffer.add(translation.fallback);
          m.forward();
          v.back();
        } else {
          invalid.push({position: v.position, char: v.char, pattern: translation.pattern});
        }

        v.forward();
      } else {
        if (!skipMaskChars) {
          buffer.add(m.char);
        }

        if (v.char === m.char) {
          charPositions.push(v.position);
          v.forward();
        } else {
          lastUntranslated = m.char;
          charPositions.push(v.position + charCount);
          charCount++;
        }

        m.forward();
      }
    }

    const lastMaskChar = this.mask.charAt(m.last);

    if (this.mask.length === value.length + 1 && !this.translations[lastMaskChar]) {
      buffer.push(lastMaskChar);
    }

    return {
      value: buffer.toString(),
      map: this.mapCharPositions(value, buffer, charPositions),
      invalid,
    };
  }

  /**
   * @param {string} value
   * @param {JMaskBuffer} buffer
   * @param charPositions
   */
  mapCharPositions (value, buffer, charPositions) {
    const diff = buffer.reverse ? buffer.length - value.length : 0;
    const map = {};

    charPositions.forEach(position => {
      map[position + diff] = 1;
    });

    return map;
  }
}

export default JmaskParser;
