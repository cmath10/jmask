import {
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest'
import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import {
  clean,
  mask,
  matches,
  unmask,
} from '@/mask'

const applyInput = (
  input: HTMLInputElement | HTMLTextAreaElement,
  {
    beforeInput = false,
    caret,
    data,
    inputType = 'insertText',
    key,
    value,
  }: {
    beforeInput?: boolean
    caret?: number
    data?: string
    inputType?: InputEvent['inputType']
    key: string
    value: string
  }
) => {
  const nextCaret = caret ?? value.length

  input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
  if (beforeInput) {
    input.dispatchEvent(new InputEvent('beforeinput', {
      bubbles: true,
      data,
      inputType,
    }))
  }
  input.value = value
  input.setSelectionRange(nextCaret, nextCaret)
  input.dispatchEvent(new InputEvent('input', {
    bubbles: true,
    data,
    inputType,
  }))
}

describe('mask e2e', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  test('formats a prefilled input on initialization', () => {
    document.body.innerHTML = '<input aria-label="Date" value="1205" />'

    const input = screen.getByLabelText<HTMLInputElement>('Date')

    mask(input, '00/00')

    expect(input.value).toBe('12/05')
    expect(clean(input)).toBe('1205')
  })

  test('formats user input and emits completion event', async () => {
    document.body.innerHTML = '<input aria-label="Date" />'

    const input = screen.getByLabelText<HTMLInputElement>('Date')
    const completed: string[] = []

    mask(input, '00/00')

    input.addEventListener('jmask:complete', (event) => {
      completed.push((event as CustomEvent<[string]>).detail[0])
    })

    await userEvent.setup().type(input, '1205')

    expect(input.value).toBe('12/05')
    expect(clean(input)).toBe('1205')
    expect(completed).toEqual(['12/05'])
  })

  test('emits jmask:change with current value detail', async () => {
    document.body.innerHTML = '<input aria-label="Date" />'

    const input = screen.getByLabelText<HTMLInputElement>('Date')
    const changes: Array<[string, Event, object]> = []

    mask(input, '00/00')

    input.addEventListener('jmask:change', (event) => {
      changes.push((event as CustomEvent<[string, Event, object]>).detail)
    })

    await userEvent.setup().type(input, '1')

    expect(changes).toHaveLength(1)
    expect(changes[0][0]).toBe('1')
    expect(changes[0][1]).toBeInstanceOf(InputEvent)
    expect(changes[0][2]).toEqual({})
  })

  test('dispatches change on blur only when value changed without native change event', () => {
    document.body.innerHTML = '<input aria-label="Date" />'

    const input = screen.getByLabelText<HTMLInputElement>('Date')
    const destroy = mask(input, '00/00')
    let changes = 0

    input.addEventListener('change', () => {
      changes++
    })

    input.dispatchEvent(new FocusEvent('blur', { bubbles: true }))
    expect(changes).toBe(0)

    input.value = '12'
    input.dispatchEvent(new FocusEvent('blur', { bubbles: true }))
    expect(changes).toBe(1)

    input.dispatchEvent(new Event('change', { bubbles: true }))
    input.dispatchEvent(new FocusEvent('blur', { bubbles: true }))
    expect(changes).toBe(2)

    destroy()
  })

  test('clears incomplete value on focusout when clearIfNotMatch is enabled', async () => {
    document.body.innerHTML = '<input aria-label="Date" />'

    const input = screen.getByLabelText<HTMLInputElement>('Date')
    const changed: string[] = []
    let nativeChanges = 0

    mask(input, '00/00', { clearIfNotMatch: true })

    input.addEventListener('jmask:change', (event) => {
      changed.push((event as CustomEvent<[string]>).detail[0])
    })
    input.addEventListener('change', () => {
      nativeChanges++
    })

    await userEvent.setup().type(input, '12')

    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))

    expect(input.value).toBe('')
    expect(changed.at(-1)).toBe('')
    expect(nativeChanges).toBe(1)
  })

  test('preserves complete value on focusout when clearIfNotMatch is enabled', async () => {
    document.body.innerHTML = '<input aria-label="Date" />'

    const input = screen.getByLabelText<HTMLInputElement>('Date')

    mask(input, '00/00', { clearIfNotMatch: true })

    await userEvent.setup().type(input, '1205')

    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))

    expect(input.value).toBe('12/05')
  })

  test('supports textarea fields', async () => {
    document.body.innerHTML = '<textarea aria-label="Date"></textarea>'

    const input = screen.getByLabelText<HTMLTextAreaElement>('Date')

    mask(input, '00/00')

    await userEvent.setup().type(input, '1205')

    expect(input.value).toBe('12/05')
    expect(clean(input)).toBe('1205')
  })

  test('supports reverse mode for monetary masks', async () => {
    document.body.innerHTML = '<input aria-label="Amount" />'

    const input = screen.getByLabelText<HTMLInputElement>('Amount')

    mask(input, '#.##0,00', { reverse: true })

    await userEvent.setup().type(input, '1234')

    expect(input.value).toBe('12,34')
    expect(clean(input)).toBe('1234')
    expect(matches(input, '12,34')).toBe(true)
  })

  test('clears a reverse-mode money value with repeated backspace', async () => {
    document.body.innerHTML = '<input aria-label="Amount" />'

    const input = screen.getByLabelText<HTMLInputElement>('Amount')
    const user = userEvent.setup()

    mask(input, '#.##0,00', { reverse: true })

    await user.type(input, '1234')

    expect(input.value).toBe('12,34')

    applyInput(input, {
      beforeInput: true,
      caret: 4,
      inputType: 'deleteContentBackward',
      key: 'Backspace',
      value: '12,3',
    })

    expect(input.value).toBe('1,23')

    applyInput(input, {
      beforeInput: true,
      caret: 3,
      inputType: 'deleteContentBackward',
      key: 'Backspace',
      value: '1,2',
    })

    expect(input.value).toBe('12')

    applyInput(input, {
      beforeInput: true,
      caret: 1,
      inputType: 'deleteContentBackward',
      key: 'Backspace',
      value: '1',
    })

    expect(input.value).toBe('1')

    applyInput(input, {
      beforeInput: true,
      caret: 0,
      inputType: 'deleteContentBackward',
      key: 'Backspace',
      value: '',
    })

    expect(input.value).toBe('')
    expect(clean(input)).toBe('')
  })

  test('handles paste for unmasked and masked values', async () => {
    document.body.innerHTML = `
      <input aria-label="Raw" />
      <input aria-label="Masked" />
    `

    const raw = screen.getByLabelText<HTMLInputElement>('Raw')
    const masked = screen.getByLabelText<HTMLInputElement>('Masked')

    mask(raw, '00/00')
    mask(masked, '00/00')

    const user = userEvent.setup()

    await user.click(raw)
    await user.paste('1205')

    await user.click(masked)
    await user.paste('12/05')

    expect(raw.value).toBe('12/05')
    expect(masked.value).toBe('12/05')
  })

  test('handles drop even if the previous key was excluded', () => {
    document.body.innerHTML = '<input aria-label="Date" />'

    const input = screen.getByLabelText<HTMLInputElement>('Date')

    mask(input, '00/00')

    input.focus()
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Control', bubbles: true }))
    input.dispatchEvent(new Event('drop', { bubbles: true }))
    input.value = '1205'
    input.setSelectionRange(4, 4)
    input.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      data: '1205',
      inputType: 'insertFromDrop',
    }))

    expect(input.value).toBe('12/05')
  })

  test('formats the final IME value on compositionend', () => {
    document.body.innerHTML = '<input aria-label="Date" />'

    const input = screen.getByLabelText<HTMLInputElement>('Date')
    const changed: string[] = []

    mask(input, '00/00')

    input.addEventListener('jmask:change', (event) => {
      changed.push((event as CustomEvent<[string]>).detail[0])
    })

    input.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }))
    input.value = '1205'
    input.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      data: '1205',
      inputType: 'insertCompositionText',
    }))

    expect(input.value).toBe('1205')
    expect(changed).toEqual([])

    input.dispatchEvent(new CompositionEvent('compositionend', {
      bubbles: true,
      data: '1205',
    }))

    expect(input.value).toBe('12/05')
    expect(clean(input)).toBe('1205')
    expect(changed).toEqual(['12/05'])
  })

  test('ignores excluded keys and restores the previous value after invalid input', () => {
    document.body.innerHTML = '<input aria-label="Date" />'

    const input = screen.getByLabelText<HTMLInputElement>('Date')
    const changed: string[] = []

    mask(input, '00/00')

    input.focus()
    input.value = '12'
    input.setSelectionRange(2, 2)

    input.addEventListener('jmask:change', (event) => {
      changed.push((event as CustomEvent<[string]>).detail[0])
    })

    applyInput(input, {
      caret: 1,
      inputType: 'deleteContentBackward',
      key: 'Backspace',
      value: '1',
    })

    expect(input.value).toBe('1')

    applyInput(input, {
      caret: 2,
      data: 'a',
      key: 'a',
      value: '1a',
    })

    expect(input.value).toBe('1')
    expect(input.selectionStart).toBe(1)
    expect(changed).toEqual([])
  })

  test.each(['ArrowLeft', 'ArrowRight', 'Tab', 'Control'])(
    'ignores %s from the exclude list',
    (key) => {
      document.body.innerHTML = '<input aria-label="Date" />'

      const input = screen.getByLabelText<HTMLInputElement>('Date')
      const changed: string[] = []

      mask(input, '00/00')

      input.focus()
      input.value = '12'
      input.setSelectionRange(2, 2)

      input.addEventListener('jmask:change', (event) => {
        changed.push((event as CustomEvent<[string]>).detail[0])
      })

      applyInput(input, {
        caret: 2,
        data: 'a',
        key,
        value: '1a',
      })

      expect(input.value).toBe('1a')
      expect(changed).toEqual([])
    }
  )

  test('supports non-field elements and cleanup', () => {
    const el = document.createElement('div')
    el.contentEditable = 'true'
    document.body.appendChild(el)

    mask(el, '00/00')

    el.dispatchEvent(new KeyboardEvent('keydown', { key: '5', bubbles: true }))
    el.innerText = '1205'
    el.dispatchEvent(new KeyboardEvent('keyup', { key: '5', bubbles: true }))

    expect(el.innerText).toBe('12/05')
    expect(clean(el)).toBe('1205')
    expect(matches(el, '12/0', true)).toBe(true)

    unmask(el)

    expect(el.innerText).toBe('1205')
  })

  test('supports custom descriptors overriding built-in ones', async () => {
    document.body.innerHTML = '<input aria-label="Code" />'

    const input = screen.getByLabelText<HTMLInputElement>('Code')

    mask(input, '0', {
      descriptors: {
        0: { pattern: /[A-Z]/ },
      },
    })

    await userEvent.setup().type(input, 'A')

    expect(input.value).toBe('A')
    expect(matches(input, 'A')).toBe(true)
  })

  test('does not emit change when processed value stays the same', () => {
    document.body.innerHTML = '<input aria-label="Date" />'

    const input = screen.getByLabelText<HTMLInputElement>('Date')
    const changed: string[] = []

    mask(input, '00/00')

    input.addEventListener('jmask:change', (event) => {
      changed.push((event as CustomEvent<[string]>).detail[0])
    })

    input.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      inputType: 'insertText',
    }))

    expect(changed).toEqual([])
  })

  test('keeps caret stable when mask map entries are after the current caret', () => {
    document.body.innerHTML = '<input aria-label="Date" />'

    const input = screen.getByLabelText<HTMLInputElement>('Date')

    mask(input, '00/00')

    input.focus()

    applyInput(input, {
      caret: 1,
      data: '3',
      key: '3',
      value: '12/3',
    })

    expect(input.selectionStart).toBe(1)
  })

  test('falls back to zero when selectionStart is unavailable', () => {
    document.body.innerHTML = '<input aria-label="Date" />'

    const input = screen.getByLabelText<HTMLInputElement>('Date')

    mask(input, '00/00')

    Object.defineProperty(input, 'selectionStart', {
      configurable: true,
      get: () => null,
    })

    input.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }))
    input.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      data: '1',
      inputType: 'insertText',
    }))

    expect(input.value).toBe('')
  })

  test('reuses mask on the same element', async () => {
    document.body.innerHTML = '<input aria-label="Value" />'

    const input = screen.getByLabelText<HTMLInputElement>('Value')
    const user = userEvent.setup()

    mask(input, '00/00')
    await user.type(input, '1205')

    expect(input.value).toBe('12/05')

    mask(input, '0000')

    expect(input.value).toBe('1205')
    expect(clean(input)).toBe('1205')
  })

  test('returns raw values for plain elements without mask state', () => {
    const input = document.createElement('input')
    input.value = '1205'

    expect(clean(input)).toBe('1205')
    expect(matches(input, '1205')).toBe(false)
    expect(() => unmask(input)).not.toThrow()
  })
})
