import JMaskParser from './JMaskParser'
import createRegex from './createRegExp'

const KEY_CODE_ALT = 18
const KEY_CODE_ARROW_DOWN = 40
const KEY_CODE_ARROW_LEFT = 37
const KEY_CODE_ARROW_RIGHT = 39
const KEY_CODE_ARROW_UP = 38
const KEY_CODE_CTRL = 17
const KEY_CODE_HOME = 36
const KEY_CODE_SHIFT = 16
const KEY_CODE_TAB = 9
const KEY_CODE_WINDOW_LEFT = 91

const KEYS_EXCLUDED_BY_DEFAULT = [
  KEY_CODE_ALT,
  KEY_CODE_ARROW_DOWN,
  KEY_CODE_ARROW_LEFT,
  KEY_CODE_ARROW_RIGHT,
  KEY_CODE_ARROW_UP,
  KEY_CODE_CTRL,
  KEY_CODE_HOME,
  KEY_CODE_SHIFT,
  KEY_CODE_TAB,
  KEY_CODE_WINDOW_LEFT,
]

const KEY_STROKE_COMPENSATION = 10

/** @type {Record<string, JMaskTranslation>} */
const TRANSLATIONS = {
  '0': { pattern: /\d/ },
  '9': { pattern: /\d/, optional: true },
  '#': { pattern: /\d/, recursive: true },
  'A': { pattern: /[a-zA-Z0-9]/ },
  'S': { pattern: /[a-zA-Z]/ },
}

const eventSupported = function (event) {
  let el = document.createElement('div')
  let supported

  event = 'on' + event
  supported = event in el

  if (!supported) {
    el.setAttribute(event, 'return;')
    supported = typeof el[event] === 'function'
  }

  el = null

  return supported
}

const inputEventAvailable = !/Chrome\/[2-4][0-9]|SamsungBrowser/.test(window.navigator.userAgent) && eventSupported('input')
const inputEventName = inputEventAvailable ? 'input' : 'keyup'

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

const calculateCaretPosition = (
  [oldValue, oldPosition, oldMap],
  [newValue, newPosition, newMap]
) => {
  if (oldValue === newValue) {
    return newPosition
  }

  if (newPosition > oldValue.length) { // if the cursor is at the end keep it there
    return newValue.length * 10
  }

  const before = maskCharsBeforeCaret(newMap, newPosition)
  const after = maskCharsAfterCaret(newMap, newPosition, newValue)
  const delta = maskCharsBeforeCaretAll(newMap, newPosition) - maskCharsBeforeCaretAll(newMap, oldPosition)

  if (newPosition <= oldPosition && oldPosition !== oldValue.length) {
    if (!inArray(newPosition, oldMap)) {
      const calculated = newPosition + delta - before

      if (!inArray(calculated, newMap)) {
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

    this.mask = mask

    let invalid = []

    let prevKeyCode = ''
    let prevValue = ''
    let prevMasked = ''
    let prevPosition = 0
    let prevPositionMap = []

    let currPositionMap = []

    let nativeChangeEventWasEmitted = false

    const keysExcluded = options.keysExcluded || KEYS_EXCLUDED_BY_DEFAULT

    /** @type {Record<string, JMaskTranslation>} */
    const translations = Object.assign({}, options.translations || {}, TRANSLATIONS)

    const regex = createRegex(this.mask, translations)
    const parser = new JMaskParser(this.mask, translations, options.reverse)

    const getValue = () => __getValue(el)
    const setValue = value => {
      if (__getValue(el) !== value) {
        __setValue(el, value)
      }
    }

    const getCaret = () => __getCaret(el, __getValue(el))
    const setCaret = position => __setCaret(el, position)

    this.getClean = () => parser.parse(getValue(), true).value

    /**
     * @param {boolean} [skipMaskChars]
     * @returns {string}
     */
    this.getMasked = skipMaskChars => {
      const { value, map, invalid: i } = parser.parse(getValue(), skipMaskChars)

      invalid = i
      currPositionMap = map

      return value
    }

    setValue(this.getMasked())

    const invokeCustomHandlers = event => {
      const value = getValue()
      const args = [value, event, el, options]
      const call = (name, args, criteria) => {
        if (typeof options[name] === 'function' && criteria) {
          options[name](...args)
        }
      }

      call('onChange', args, value !== prevValue)
      call('onComplete', args, value.length === this.mask.length)
      call('onInvalid', [value, event, el, invalid, options], invalid.length > 0)
    }

    const onBlur = () => {
      if (prevValue !== getValue() && !nativeChangeEventWasEmitted) {
        const event = document.createEvent('HTMLEvents')

        event.initEvent('change', false, true)

        el.dispatchEvent(event)
      }

      nativeChangeEventWasEmitted = false
    }

    const onChange = () => {
      nativeChangeEventWasEmitted = true
    }

    const onFocusOut = () => {
      if (options.clearIfNotMatch && !regex.test(getValue())) {
        setValue('')
      }
    }

    const onInput = event => {
      invalid = []

      if (!inArray(prevKeyCode, keysExcluded)) {
        const masked = this.getMasked()
        const caret = getCaret()

        // this is a compensation to devices/browsers that don't compensate
        // caret positioning the right way
        setTimeout(() => {
          setCaret(calculateCaretPosition(
            [prevMasked, prevPosition, prevPositionMap],
            [this.getMasked(), getCaret(), currPositionMap]
          ))
        }, KEY_STROKE_COMPENSATION)

        setValue(masked)
        setCaret(caret)

        invokeCustomHandlers(event)
      }
    }

    /**
     * @param {KeyboardEvent} event
     */
    const onKeydown = event => {
      const currKeyCode = event.key || event.keyCode || event.which

      prevKeyCode = currKeyCode.toString()
      prevMasked = getValue()
      prevPosition = getCaret()
      prevPositionMap = currPositionMap
    }

    const on = (eventName, handler) => el.addEventListener(eventName, handler)
    const off = (eventName, handler) => el.removeEventListener(eventName, handler)

    on('blur', onBlur)
    on('change', onChange)
    on('focusout', onFocusOut)
    on('keydown', onInput)
    on(inputEventName, onKeydown)

    this.destroy = () => {
      off('blur', onBlur)
      off('change', onChange)
      off('focusout', onFocusOut)
      off('keydown', onInput)
      off(inputEventName, onKeydown)

      const caret = getCaret()

      setValue(this.getClean())
      setCaret(caret)
    }
  }
}
