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
    const chunks = [];

    let pattern;
    let optional;
    let recursive;
    let recursiveOptions;
    let regex;

    for (let i = 0, translation, char; i < this.length; i++) {
      char = this.char(i);
      translation = this.translation[char];

      if (translation) {

        pattern = translation.pattern.toString().replace(/.{1}$|^.{1}/g, '');
        optional = translation.optional;
        recursive = translation.recursive;

        if (recursive) {
          chunks.push(char);
          recursiveOptions = {char, pattern};
        } else {
          chunks.push(!optional && !recursive ? pattern : (pattern + '?'));
        }

      } else {
        chunks.push(char.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
      }
    }

    regex = chunks.join('');

    if (recursiveOptions) {
      regex = regex
        .replace(new RegExp('(' + recursiveOptions.char + '(.*' + recursiveOptions.char + ')?)'), '($1)?')
        .replace(new RegExp(recursiveOptions.char, 'g'), recursiveOptions.pattern);
    }

    return new RegExp(regex);
  }

  get length () {
    return this.mask.length;
  }

  /**
   * @param i
   * @returns {string}
   */
  char (i) {
    return this.mask.charAt(i);
  }
}

export default JMaskRegex;