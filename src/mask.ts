import type {
  Descriptor,
  Options,
} from '@/types'

import type { Parse } from '@/parse'

import { createParser } from '@/parse'

import createRegExp from '@/createRegExp'

import { CONTROLS } from '@/keys'

export type ChangeEvent<O extends Options = Options> = CustomEvent<[string, InputEvent | KeyboardEvent, O]>
export type CompleteEvent<O extends Options = Options> = CustomEvent<[string, InputEvent | KeyboardEvent, O]>

export type {
  Descriptor,
  Options,
}

const DESCRIPTORS: Record<string, Descriptor> = {
  '0': { pattern: /\d/ },
  '9': { pattern: /\d/, optional: true },
  '#': { pattern: /\d/, recursive: true },
  'A': { pattern: /[a-zA-Z0-9]/ },
  'S': { pattern: /[a-zA-Z]/ },
}

const MASK_STATE = Symbol('jmask-state')

type MaskState<O extends Options = Options> = {
  clearIfNotMatch: boolean
  changeEmitted: boolean
  exclude: string[]
  options: O
  parse: Parse
  regex: RegExp
  stored: {
    key: string
    value: string
    caret: number
    map: number[]
  }
  unmask?: () => void
}

type MaskedElement = HTMLElement & {
  [MASK_STATE]?: MaskState
}

const isField = (el: HTMLElement): el is HTMLInputElement | HTMLTextAreaElement => {
  return el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
}

const count = <T>(entries: T[], predicate: (value: T) => boolean) => {
  let count = 0

  for (let i = 0; i < entries.length; i++) {
    if (predicate(entries[i])) {
      count++
    }
  }

  return count
}

const getState = (el: HTMLElement) => (el as MaskedElement)[MASK_STATE]

const getValue = (el: HTMLElement) => isField(el) ? el.value : el.innerText

const setValue = (el: HTMLElement, value: string) => {
  if (getValue(el) !== value) {
    if (isField(el)) {
      el.value = value
    } else {
      el.innerText = value
    }
  }
}

const getCaret = (el: HTMLElement) => isField(el) ? el.selectionStart ?? 0 : 0
const setCaret = (el: HTMLElement, position: number) => {
  if (document.activeElement === el && isField(el)) {
    el.setSelectionRange(position, position)
  }
}

export const clean = (el: HTMLElement) => {
  const state = getState(el)

  return state ? state.parse(getValue(el), true).value : getValue(el)
}

export const matches = (el: HTMLElement, value: string, partial = false) => {
  const state = getState(el)
  if (!state) {
    return false
  }

  return partial ? state.parse(value).invalid.length === 0 : state.regex.test(value)
}

export const unmask = (el: HTMLElement) => {
  const state = getState(el)

  if (!state) {
    return
  }

  state.unmask?.()
}

export const mask = <O extends Options = Options>(
  el: HTMLElement,
  maskPattern: string,
  options: O = {} as O
) => {
  unmask(el)

  const descriptors = { ...DESCRIPTORS, ...(options.descriptors ?? {}) }
  const state: MaskState<O> = {
    clearIfNotMatch: options.clearIfNotMatch ?? false,
    changeEmitted: false,
    exclude: [...(options.exclude ?? []), ...CONTROLS],
    options,
    parse: createParser(maskPattern, descriptors, options.reverse),
    regex: createRegExp(maskPattern, descriptors),
    stored: {
      key: '',
      value: '',
      caret: 0,
      map: [],
    },
  }

  const parsed = state.parse(getValue(el))

  setValue(el, parsed.value)
  state.stored.value = getValue(el)
  state.stored.caret = getCaret(el)
  state.stored.map = parsed.map

  const onBlur = () => {
    if (state.stored.value !== getValue(el) && !state.changeEmitted) {
      el.dispatchEvent(new Event('change', {
        bubbles: true,
        cancelable: false,
      }))
    }

    state.changeEmitted = false
  }

  const onChange = () => {
    state.changeEmitted = true
  }

  const onFocusOut = () => {
    if (state.clearIfNotMatch && !matches(el, getValue(el))) {
      setValue(el, '')
    }
  }

  const onKeyDown = (event: KeyboardEvent) => {
    state.stored.key = event.key
    state.stored.value = getValue(el)
    state.stored.caret = getCaret(el)
  }

  const process = (event: Event) => {
    if (state.exclude.includes(state.stored.key)) {
      return
    }

    const parsed = state.parse(getValue(el))
    const caret = getCaret(el)

    if (parsed.invalid.length === 0) {
      const offset = count(parsed.map, i => i < caret) - count(state.stored.map, i => i < state.stored.caret)

      setValue(el, parsed.value)
      setCaret(el, caret + offset)
      state.stored.map = parsed.map

      const value = getValue(el)
      const detail: [string, InputEvent | KeyboardEvent, O] = [value, event as InputEvent | KeyboardEvent, state.options]

      if (value !== state.stored.value) {
        el.dispatchEvent(new CustomEvent('jmask:change', { detail }))
      }

      if (matches(el, value)) {
        el.dispatchEvent(new CustomEvent('jmask:complete', { detail }))
      }
    } else {
      setValue(el, state.stored.value)
      setCaret(el, state.stored.caret)
    }
  }

  el.addEventListener('blur', onBlur)
  el.addEventListener('change', onChange, { passive: true })
  el.addEventListener('focusout', onFocusOut)
  el.addEventListener('keydown', onKeyDown)
  el.addEventListener(isField(el) ? 'input' : 'keyup', process)

  state.unmask = () => {
    el.removeEventListener('blur', onBlur)
    el.removeEventListener('change', onChange)
    el.removeEventListener('focusout', onFocusOut)
    el.removeEventListener('keydown', onKeyDown)
    el.removeEventListener(isField(el) ? 'input' : 'keyup', process)

    const caret = getCaret(el)

    setValue(el, clean(el))
    setCaret(el, caret)
    delete (el as MaskedElement)[MASK_STATE]
  }

  ;(el as MaskedElement)[MASK_STATE] = state

  return state.unmask
}
