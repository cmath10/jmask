import DEFAULTS from './jmask-defaults'

import JMaskParser from './jmask-parser'
import JMaskRegex from './jmask-regex'

const KEY_STROKE_COMPENSATION = 10

const inArray = (value, arr) => arr.indexOf(value) !== -1

const maskCharsBeforeCaret = (maskCharsMap, caretPosition) => {
  let count = 0

  for (let i = caretPosition - 1; i >= 0; i--) {
    if (!inArray(i, maskCharsMap)) {
      break
    }

    count++
  }

  return count
}

const maskCharsAfterCaret = (maskCharsMap, caretPosition, value) => {
  let count = 0

  for (let i = caretPosition; i < value.length; i++) {
    if (!inArray(i, maskCharsMap)) {
      break
    }

    count++
  }

  return count
}

const maskCharsBeforeCaretAll = (maskCharsMap, caretPosition) => {
  return maskCharsMap.filter(p => p < caretPosition).length
}

const calculateCaretPosition = (prevState, currState) => {
  const oldValue = prevState.value
  const newValue = currState.value

  const oldPosition = prevState.caretPosition
  const newPosition = currState.caretPosition

  if (oldValue === newValue) {
    return newPosition
  }

  if (newPosition > oldValue.length) { // if the cursor is at the end keep it there
    return newValue.length * 10
  }

  const map = currState.maskCharMap

  const before = maskCharsBeforeCaret(map, newPosition)
  const after = maskCharsAfterCaret(map, newPosition, newValue)
  const delta = maskCharsBeforeCaretAll(map, newPosition) - maskCharsBeforeCaretAll(map, oldPosition)

  if (newPosition <= oldPosition && oldPosition !== oldValue.length) {
    if (!inArray(newPosition, prevState.maskCharMap)) {
      const calculated = newPosition + delta - before

      if (!inArray(calculated, map)) {
        return calculated
      }
    }

    return newPosition
  }

  if (newPosition > oldPosition) {
    return newPosition + delta + after
  }

  return newPosition
}

const __getValue = el => el instanceof HTMLInputElement ? el.value : el.innerText
const __setValue = (el, value) => {
  if (el instanceof HTMLInputElement) {
    el.value = value
  } else {
    el.innerText = value
  }
}

const __getCaret = (el, value) => {
  try {
    if (document.selection && navigator.appVersion.indexOf('MSIE 10') === -1) { // IE Support
      const range = document.selection.createRange()

      range.moveStart('character', -value.length)

      return range.text.length
    } else if (el.selectionStart || el.selectionStart === '0') {
      return el.selectionStart
    }

    return 0
  } catch (error) {
    return undefined
  }
}

const __setCaret = (el, position) => {
  try {
    if (document.activeElement === el) {
      if (el.setSelectionRange) {
        el.setSelectionRange(position, position)
      } else { //IE
        const range = el.createTextRange()

        range.collapse(true)
        range.moveEnd('character', position)
        range.moveStart('character', position)
        range.select()
      }
    }
  } catch (error) {}
}

export default class JMask {
  /**
   * @param {HTMLElement} el
   * @param {string} mask
   * @param {JMaskOptions} [options]
   */
  constructor (el, mask, options) {
    options = options || {}

    this.el = el
    this.mask = mask
    this.options = options
    this.translations = Object.assign({}, options.translations || {}, DEFAULTS.translations)
    this.keysExcluded = options.keysExcluded || DEFAULTS.keysExcluded

    this.oldValue = ''
    this.caretPosition = 0
    this.changed = false
    this.invalid = []
    this.maskCharPositionMap = []
    this.maskCharPositionMapOld = []
    this.keyCode = undefined
    this.maskPreviousValue = ''
    this.regex = new JMaskRegex(mask, options.translations)
    this.parser = new JMaskParser(mask, {
      reverse: options.reverse || false,
      translations: this.translations,
    })

    this.inputEventName = DEFAULTS.useInputEvent ? 'input' : 'keyup'

    this.value = this.getMasked()

    this.handlers = {
      blur: event => this.onBlur(event),
      change: event => this.onChange(event),
      focusout: event => this.onFocusOut(event),
      input: event => this.onInput(event),
      keydown: event => this.onKeydown(event),
    }

    this.el.addEventListener('blur', this.handlers.blur)
    this.el.addEventListener('change', this.handlers.change)
    this.el.addEventListener('focusout', this.handlers.focusout)
    this.el.addEventListener('keydown', this.handlers.keydown)
    this.el.addEventListener(this.inputEventName, this.handlers.input)
  }

  get value () {
    return __getValue(this.el)
  }

  set value (value) {
    if (this.value !== value) {
      __setValue(this.el, value)
    }
  }

  get caret () {
    return __getCaret(this.el, this.value)
  }

  set caret (position) {
    __setCaret(this.el, position)
  }

  calculateCaretPosition () {
    return calculateCaretPosition({
      value: this.maskPreviousValue,
      caretPosition: this.caretPosition,
      maskCharMap: this.maskCharPositionMapOld,
    }, {
      value: this.getMasked(),
      caretPosition: this.caret,
      maskCharMap: this.maskCharPositionMap,
    })
  }

  getClean () {
    return this.parser.parse(this.value, true).value
  }

  /**
   * @param skipMaskChars
   * @returns {string}
   */
  getMasked (skipMaskChars) {
    const { value, map, invalid } = this.parser.parse(this.value, skipMaskChars)

    this.invalid = invalid
    this.maskCharPositionMap = map

    return value
  }

  onInput (event) {
    event = event || window.event

    this.invalid = []

    if (!inArray(this.keyCode, this.keysExcluded)) {
      const masked = this.getMasked()
      const caret = this.caret

      // this is a compensation to devices/browsers that don't compensate
      // caret positioning the right way
      setTimeout(() => {
        this.caret = this.calculateCaretPosition()
      }, KEY_STROKE_COMPENSATION)

      this.value = masked
      this.caret = caret

      return this.callbacks(event)
    }
  }

  onChange () {
    this.changed = true
  }

  onBlur () {
    if (this.oldValue !== this.value && !this.changed) {
      const event = document.createEvent('HTMLEvents')

      event.initEvent('change', false, true)

      this.el.dispatchEvent(event)
    }

    this.changed = false
  }

  onFocusOut () {
    if (this.options.clearIfNotMatch && !this.regex.test(this.value)) {
      this.value = ''
    }
  }

  /**
   * @param {KeyboardEvent} event
   */
  onKeydown (event) {
    const keyCode = event.key || event.keyCode || event.which

    this.keyCode = keyCode.toString()
    this.maskPreviousValue = this.value
    this.caretPosition = this.caret

    this.maskCharPositionMapOld = this.maskCharPositionMap
  }

  /**
   * Custom event handlers
   * @param event
   */
  callbacks (event) {
    const changed = this.value !== this.oldValue
    const defaultArgs = [this.value, event, this.el, this.options]

    const callback = (name, criteria, args) => {
      if (typeof this.options[name] === 'function' && criteria) {
        this.options[name].apply(this, args)
      }
    }

    callback('onChange', changed === true, defaultArgs)
    callback('onComplete', this.value.length === this.mask.length, defaultArgs)
    callback('onInvalid', this.invalid.length > 0, [this.value, event, this.el, this.invalid, this.options])
  }

  destroy () {
    this.el.removeEventListener('blur', this.handlers.blur)
    this.el.removeEventListener('change', this.handlers.change)
    this.el.removeEventListener('focusout', this.handlers.focusout)
    this.el.removeEventListener('keydown', this.handlers.keydown)
    this.el.removeEventListener(this.inputEventName, this.handlers.input)

    const caret = this.caret

    this.value = this.getClean()
    this.caret = caret
  }
}
