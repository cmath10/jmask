import JmaskParser from './jmask-parser';
import JMaskRegex from './jmask-regex';

class Jmask {
  /**
   * @param {HTMLElement} el
   * @param {Object} [options]
   */
  static attachTo (el, options) {
    return new Jmask(el, options);
  }

  /**
   * @param {HTMLElement} el
   * @param {Object} [options] @TODO validate this param
   */
  constructor (el, options) {
    options = options || {};

    const mask = options.mask || el.dataset.mask;

    this.el = el;
    this.mask = mask;
    this.parser = new JmaskParser(mask, {
      reverse: options.reverse || false,
      translation: options.translation || {},
    });
    this.regex = new JMaskRegex(mask, options.translation);
  }

  destroy () {
  }
}

export default Jmask;
