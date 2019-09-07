import DEFAULTS from './jmask-defaults';

import JmaskParser from './jmask-parser';
import JMaskRegex from './jmask-regex';

const KEY_STROKE_COMPENSATION = 10;

class Jmask {
  /**
   * @param {HTMLElement} el
   * @param {string} mask
   * @param {JMaskOptions} [options]
   */
  constructor (el, mask, options) {
    options = options || {};

    this.el = el;
    this.mask = mask;
    this.options = options;
    this.clearIfNotMatch = options.clearIfNotMatch || false;
    this.reverse = options.reverse || false;
    this.translations = options.translations || DEFAULTS.translations;
    this.keysExcluded = options.keysExcluded || DEFAULTS.keysExcluded;

    this.oldValue = '';
    this.caretPosition = 0;
    this.changed = false;
    this.invalid = [];
    this.maskCharPositionMap = {};
    this.maskCharPositionMapOld = {};
    this.keyCode = undefined;
    this.maskPreviousValue = '';
    this.parser = new JmaskParser(mask, {
      reverse: this.reverse,
      translations: this.translations,
    });
    this.regex = new JMaskRegex(mask, options.translations);

    this.inputEventName = DEFAULTS.useInputEvent ? 'input' : 'keyup';

    this.handlers = {
      blur: event => this.onBlur(event),
      change: event => this.onChange(event),
      focusout: event => this.onFocusOut(event),
      input: event => this.onInput(event),
      keydown: event => this.onKeydown(event),
    };

    this.el.addEventListener('blur', this.handlers.blur);
    this.el.addEventListener('change', this.handlers.change);
    this.el.addEventListener('focusout', this.handlers.focusout);
    this.el.addEventListener('keydown', this.handlers.keydown);
    this.el.addEventListener(this.inputEventName, this.handlers.input);
  }

  calculateCaretPosition () {
    const oldValue = this.maskPreviousValue;
    const newValue = this.getMasked();

    if (oldValue === newValue) {
      return this.caret;
    }

    let position = this.caret;

    let caretPositionOld = this.caretPosition;
    let maskCharsBeforeCaret = 0;
    let maskCharsAfterCaret = 0;
    let maskCharsBeforeCaretAll = 0;
    let maskCharsBeforeCaretAllOld = 0;
    let i;

    for (i = position; i < newValue.length; i++) {
      if (!this.maskCharPositionMap[i]) {
        break;
      }

      maskCharsAfterCaret++;
    }

    for (i = position - 1; i >= 0; i--) {
      if (!this.maskCharPositionMap[i]) {
        break;
      }

      maskCharsBeforeCaret++;
    }

    for (i = position - 1; i >= 0; i--) {
      if (this.maskCharPositionMap[i]) {
        maskCharsBeforeCaretAll++;
      }
    }

    for (i = caretPositionOld - 1; i >= 0; i--) {
      if (this.maskCharPositionMap[i]) {
        maskCharsBeforeCaretAllOld++;
      }
    }

    // if the cursor is at the end keep it there
    if (position > oldValue.length) {
      position = newValue.length * 10;
    } else if (caretPositionOld >= position && caretPositionOld !== oldValue.length) {
      if (!this.maskCharPositionMapOld[position]) {
        let caretPos = position;

        position -= maskCharsBeforeCaretAllOld - maskCharsBeforeCaretAll;
        position -= maskCharsBeforeCaret;

        if (this.maskCharPositionMap[position]) {
          position = caretPos;
        }
      }
    } else if (position > caretPositionOld) {
      position += maskCharsBeforeCaretAll - maskCharsBeforeCaretAllOld;
      position += maskCharsAfterCaret;
    }

    return position;
  }

  getClean () {
    return this.getMasked(true);
  }

  /**
   * Method applies mask to value val
   * @param skipMaskChars
   * @returns {string}
   */
  getMasked (skipMaskChars) {
    const {buffer, map, invalid} = this.parser.parse(this.value, skipMaskChars);

    this.invalid = invalid;
    this.maskCharPositionMap = map;

    return buffer.toString();
  }

  onBlur () {
    if (this.oldValue !== this.value && !this.changed) {
      const event = document.createEvent('HTMLEvents');

      event.initEvent('change', false, true);

      this.el.dispatchEvent(event);
    }

    this.changed = false;
  }

  onFocusOut () {
    if (this.clearIfNotMatch && !this.regex.test(this.value)) {
      this.value = '';
    }
  }

  onChange () {
    this.changed = true;
  }

  onInput (event) {
    event = event || window.event;

    this.invalid = [];

    const keyCode = this.keyCode;

    if (!this.keysExcluded.includes(keyCode)) {
      const masked = this.getMasked();
      const caret = this.caret;

      // this is a compensation to devices/browsers that don't compensate
      // caret positioning the right way
      setTimeout(() => {
        this.caret = this.calculateCaretPosition();
      }, KEY_STROKE_COMPENSATION);

      this.value = masked;
      this.caret = caret;

      return this.callbacks(event);
    }
  }

  /**
   * @param {KeyboardEvent} event
   */
  onKeydown (event) {
    const keyCode = event.keyCode || event.which;

    this.keyCode = keyCode.toString();
    this.maskPreviousValue = this.value;
    this.caretPosition = this.caret;

    this.maskCharPositionMapOld = this.maskCharPositionMap;
  }

  get caret () {
    try {
      if (document.selection && navigator.appVersion.indexOf('MSIE 10') === -1) { // IE Support
        let range;

        range = document.selection.createRange();
        range.moveStart('character', -this.value.length);

        return range.text.length;
      } else if (this.el.selectionStart || this.el.selectionStart === '0') {
        return this.el.selectionStart;
      }

      return 0;
    } catch (error) {
      return undefined;
    }
  }

  set caret (position) {
    try {
      if (document.activeElement === this.el) {
        if (this.el.setSelectionRange) {
          this.el.setSelectionRange(position, position);
        } else { //IE
          const range = this.el.createTextRange();

          range.collapse(true);
          range.moveEnd('character', position);
          range.moveStart('character', position);
          range.select();
        }
      }
    } catch (error) {}
  }

  get value () {
    if (this.el instanceof HTMLInputElement) {
      return this.el.value;
    }

    return this.el.innerText;
  }

  set value (value) {
    if (this.value === value) {
      return;
    }

    if (this.el instanceof HTMLInputElement) {
      this.el.value = value;
    } else {
      this.el.innerText = value;
    }
  }

  /**
   * Custom event handlers
   * @param event
   */
  callbacks (event) {
    const changed = this.value !== this.oldValue;
    const defaultArgs = [this.value, event, this.el, this.options];

    const callback = (name, criteria, args) => {
      if (typeof this.options[name] === 'function' && criteria) {
        this.options[name].apply(this, args);
      }
    };

    callback('onChange', changed === true, defaultArgs);
    callback('onComplete', this.value.length === this.mask.length, defaultArgs);
    callback('onInvalid', this.invalid.length > 0, [this.value, event, this.el, this.invalid, this.options]);
  }

  destroy () {
    this.value = this.getClean();
    this.el.removeEventListener('blur', this.handlers.blur);
    this.el.removeEventListener('change', this.handlers.change);
    this.el.removeEventListener('focusout', this.handlers.focusout);
    this.el.removeEventListener('keydown', this.handlers.keydown);
    this.el.removeEventListener(this.inputEventName, this.handlers.input);
  }
}

export default Jmask;
