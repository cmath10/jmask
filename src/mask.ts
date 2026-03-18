import type {
  Descriptor,
  Options,
} from '@/types'

import { compile } from '@/compile'
import type { Parse } from '@/parse'

import {
  createParser,
  createRegExp,
} from '@/parse'

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

// Internal state keys are intentionally short to squeeze a bit more out of the bundle.
type MaskState<O extends Options = Options> = {
  // clearIfNotMatch
  c: boolean
  // changeEmitted
  e: boolean
  // options
  o: O
  // parse
  p: Parse
  // regex
  r: RegExp
  // stored
  s: {
    // caret
    c: number
    // key
    k: string
    // map
    m: number[]
    // value
    v: string
  }
  // unmask
  u?: () => void
  // exclude
  x: string[]
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

const prepare = (
  value: string,
  descriptors: Record<string, Descriptor>,
  reverse = false
) => (parts => ({
  p: createParser(parts, reverse),
  r: createRegExp(parts),
}))(compile(value, descriptors))

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

  return state ? state.p(getValue(el), true).value : getValue(el)
}

export const matches = (el: HTMLElement, value: string, partial = false) => {
  const state = getState(el)
  if (!state) {
    return false
  }

  return partial ? state.p(value).invalid.length === 0 : state.r.test(value)
}

export const unmask = (el: HTMLElement) => {
  const state = getState(el)

  if (!state) {
    return
  }

  state.u?.()
}

export const mask = <O extends Options = Options>(
  el: HTMLElement,
  maskPattern: string,
  options: O = {} as O
) => {
  unmask(el)

  const descriptors = { ...DESCRIPTORS, ...(options.descriptors ?? {}) }
  const state: MaskState<O> = {
    c: options.clearIfNotMatch ?? false,
    e: false,
    o: options,
    ...prepare(maskPattern, descriptors, options.reverse),
    s: {
      c: 0,
      k: '',
      m: [],
      v: '',
    },
    x: [...(options.exclude ?? []), ...CONTROLS],
  }

  const parsed = state.p(getValue(el))

  setValue(el, parsed.value)
  state.s.v = getValue(el)
  state.s.c = getCaret(el)
  state.s.m = parsed.map

  const onBlur = () => {
    if (state.s.v !== getValue(el) && !state.e) {
      el.dispatchEvent(new Event('change', {
        bubbles: true,
        cancelable: false,
      }))
    }

    state.e = false
  }

  const onChange = () => {
    state.e = true
  }

  const onFocusOut = () => {
    if (state.c && !state.r.test(getValue(el))) {
      setValue(el, '')
    }
  }

  const onKeyDown = (event: KeyboardEvent) => {
    state.s.k = event.key
    state.s.v = getValue(el)
    state.s.c = getCaret(el)
  }

  const process = (event: Event) => {
    if (state.x.includes(state.s.k)) {
      return
    }

    const parsed = state.p(getValue(el))
    const caret = getCaret(el)

    if (parsed.invalid.length === 0) {
      const offset = count(parsed.map, i => i < caret) - count(state.s.m, i => i < state.s.c)

      setValue(el, parsed.value)
      setCaret(el, caret + offset)
      state.s.m = parsed.map

      const value = getValue(el)
      const detail: [string, InputEvent | KeyboardEvent, O] = [value, event as InputEvent | KeyboardEvent, state.o]

      if (value !== state.s.v) {
        el.dispatchEvent(new CustomEvent('jmask:change', { detail }))
      }

      if (state.r.test(value)) {
        el.dispatchEvent(new CustomEvent('jmask:complete', { detail }))
      }
    } else {
      setValue(el, state.s.v)
      setCaret(el, state.s.c)
    }
  }

  const offs: Array<() => void> = []
  const on = <K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (event: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions
  ) => {
    el.addEventListener(type, listener as EventListener, options)
    offs.push(() => {
      el.removeEventListener(type, listener as EventListener, options)
    })
  }

  on('blur', onBlur)
  on('change', onChange, { passive: true })
  on('focusout', onFocusOut)
  on('keydown', onKeyDown)
  on(isField(el) ? 'input' : 'keyup', process)

  state.u = () => {
    offs.forEach(off => off())
    offs.length = 0

    const caret = getCaret(el)

    setValue(el, clean(el))
    setCaret(el, caret)
    delete (el as MaskedElement)[MASK_STATE]
  }

  ;(el as MaskedElement)[MASK_STATE] = state

  return state.u
}
