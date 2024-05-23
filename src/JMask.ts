import type {
  Descriptor,
  Options,
} from '@/types'

import Parser from '@/Parser'

import createRegExp from '@/createRegExp'

import { CONTROLS } from '@/keys'

const DESCRIPTORS: Record<string, Descriptor> = {
  '0': { pattern: /\d/ },
  '9': { pattern: /\d/, optional: true },
  '#': { pattern: /\d/, recursive: true },
  'A': { pattern: /[a-zA-Z0-9]/ },
  'S': { pattern: /[a-zA-Z]/ },
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

export default class JMask {
  private readonly _el: HTMLElement
  private readonly _regex: RegExp
  private readonly _parser: Parser
  private readonly _clearIfNotMatch: boolean
  private readonly _exclude: string[]
  private readonly _stored: {
    key: string
    value: string
    caret: number
    map: number[]
  } = { key: '', value: '', caret: 0, map: [] }

  public readonly destroy: () => void

  constructor(el: HTMLElement, mask: string, options: Options = {}) {
    const descriptors = { ...(options.descriptors ?? {}), ...DESCRIPTORS }

    this._el = el
    this._regex = createRegExp(mask, descriptors)
    this._parser = new Parser(mask, descriptors, options.reverse)
    this._clearIfNotMatch = options.clearIfNotMatch ?? false
    this._exclude = [...(options.exclude ?? []), ...CONTROLS]

    const parsed = this._parser.parse(this.value)

    this.value = parsed.value
    this._stored.value = this.value
    this._stored.caret = this.caret
    this._stored.map = parsed.map

    let changeEmitted = false

    const onBlur = () => {
      if (this._stored.value !== this.value && !changeEmitted) {
        el.dispatchEvent(new Event('change', {
          bubbles: true,
          cancelable: false,
        }))
      }

      changeEmitted = false
    }

    const onChange = () => changeEmitted = true
    const onFocusOut = () => {
      if (this._clearIfNotMatch && !this._regex.test(this.value)) {
        this.value = ''
      }
    }

    const onKeyDown = (event: KeyboardEvent) => this.prepare(event)
    const process = (event: Event) => this.process(event as InputEvent | KeyboardEvent, options)

    el.addEventListener('blur', onBlur)
    el.addEventListener('change', onChange, { passive: true })
    el.addEventListener('focusout', onFocusOut)
    el.addEventListener('keydown', onKeyDown)
    el.addEventListener(isField(el) ? 'input' : 'keyup', process)

    this.destroy = () => {
      el.removeEventListener('blur', onBlur)
      el.removeEventListener('change', onChange)
      el.removeEventListener('focusout', onFocusOut)
      el.removeEventListener('keydown', onKeyDown)
      el.removeEventListener(isField(el) ? 'input' : 'keyup', process)

      const caret = this.caret

      this.value = this.clean
      this.caret = caret
    }
  }

  get caret() {
    return isField(this._el) ? this._el.selectionStart ?? 0 : 0
  }

  set caret(position: number) {
    if (document.activeElement === this._el && isField(this._el)) {
      this._el.setSelectionRange(position, position)
    }
  }

  get value() {
    return isField(this._el) ? this._el.value : this._el.innerText
  }

  set value(value: string) {
    if (this.value !== value) {
      if (isField(this._el)) {
        this._el.value = value
      } else {
        this._el.innerText = value
      }
    }
  }

  get clean() {
    return this._parser.parse(this.value, true).value
  }

  prepare(event: KeyboardEvent) {
    this._stored.key = event.key
    this._stored.value = this.value
    this._stored.caret = this.caret
  }

  process(event: InputEvent | KeyboardEvent, options: Options) {
    if (!this._exclude.includes(this._stored.key)) {
      const parsed = this._parser.parse(this.value)
      const caret = this.caret

      if (parsed.invalid.length === 0) {
        this.value = parsed.value
        this.caret = caret
        + count(parsed.map, i => i < caret)
        - count(this._stored.map, i => i < this._stored.caret)
        this._stored.map = parsed.map

        const value = this.value
        const detail = [value, event, options]

        if (value !== this._stored.value) {
          this._el.dispatchEvent(new CustomEvent('jmask:change', { detail }))
        }

        if (this._regex.test(value)) {
          this._el.dispatchEvent(new CustomEvent('jmask:complete', { detail }))
        }
      } else {
        this.value = this._stored.value
        this.caret = this._stored.caret
      }
    }
  }
}

export type ChangeEvent<O extends Options = Options> = CustomEvent<[string, InputEvent | KeyboardEvent, O]>
export type CompleteEvent<O extends Options = Options> = CustomEvent<[string, InputEvent | KeyboardEvent, O]>

export type {
  Descriptor,
  Options,
}
