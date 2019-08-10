class JMaskRegex {
  /**
   * @param {string} mask
   */
  constructor (mask) {
    this.mask = mask;
    this.translation = {
      '0': {pattern: /\d/},
      '9': {pattern: /\d/, optional: true},
      '#': {pattern: /\d/, recursive: true},
      'A': {pattern: /[a-zA-Z0-9]/},
      'S': {pattern: /[a-zA-Z]/},
    };
  }

  /**
   * @param {string} value
   */
  test (value) {
    return this.regex.test(value);
  }

  get regex () {
    let chunks = [], pattern, optional, recursive, oRecursive, r;

    for (let i = 0, translation, char; i < this.length; i++) {
      char = this.char(i);
      translation = this.translation[char];

      if (translation) {

        pattern = translation.pattern.toString().replace(/.{1}$|^.{1}/g, '');
        optional = translation.optional;
        recursive = translation.recursive;

        if (recursive) {
          chunks.push(char);
          oRecursive = {digit: char, pattern};
        } else {
          chunks.push(!optional && !recursive ? pattern : (pattern + '?'));
        }

      } else {
        chunks.push(char.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
      }
    }

    r = chunks.join('');

    if (oRecursive) {
      r = r
        .replace(new RegExp('(' + oRecursive.digit + '(.*' + oRecursive.digit + ')?)'), '($1)?')
        .replace(new RegExp(oRecursive.digit, 'g'), oRecursive.pattern);
    }

    return new RegExp(r);
  }

  get length () {
    return this.mask.length
  }

  /**
   * @param i
   * @returns {string}
   */
  char (i) {
    return this.mask.charAt(i);
  }
}

export default JMaskRegex