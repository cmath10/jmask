import { translations as defaultTranslations } from './jmask-defaults';

class JMaskBuffer {
  constructor (reverse) {
    this._chars = [];
    this._reverse = reverse;
  }

  get reverse () {
    return this._reverse;
  }

  get length () {
    return this._chars.length;
  }

  add (char) {
    if (this._reverse) {
      this._chars.unshift(char);
    } else {
      this._chars.push(char);
    }
  }

  push (char) {
    this._chars.push(char);
  }

  toString () {
    return this._chars.join('');
  }
}

class JMaskConveyor {
  constructor (value, reverse) {
    this._value = value;
    this._reverse = reverse;
    this._offset = reverse ? -1 : 1;
    this._first = reverse ? value.length - 1 : 0;
    this._last = reverse ? 0 : value.length - 1;
    this._position = this._first;
  }

  forward () {
    this._position += this._offset;
  }

  back () {
    this._position -= this._offset;
  }

  get char () {
    return this._value.charAt(this._position);
  }

  get last () {
    return this._last;
  }

  get position () {
    return this._position;
  }

  set position (position) {
    this._position = position;
  }

  get offset () {
    return this._offset;
  }

  get finished () {
    return this._reverse ? this._position <= -1 : this._position >= this._value.length;
  }
}

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
