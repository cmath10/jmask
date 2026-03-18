import {
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest'
import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import JMask from '@/JMask'

describe('JMask e2e', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  test('formats a prefilled input on initialization', () => {
    document.body.innerHTML = '<input aria-label="Date" value="1205" />'

    const input = screen.getByLabelText<HTMLInputElement>('Date')
    const mask = new JMask(input, '00/00')

    expect(input.value).toBe('12/05')
    expect(mask.clean).toBe('1205')
  })

  test('formats user input and emits completion event', async () => {
    document.body.innerHTML = '<input aria-label="Date" />'

    const input = screen.getByLabelText<HTMLInputElement>('Date')
    const mask = new JMask(input, '00/00')
    const completed: string[] = []

    input.addEventListener('jmask:complete', (event) => {
      completed.push((event as CustomEvent<[string]>).detail[0])
    })

    await userEvent.setup().type(input, '1205')

    expect(input.value).toBe('12/05')
    expect(mask.clean).toBe('1205')
    expect(completed).toEqual(['12/05'])
  })

  test('emits jmask:change with current value detail', async () => {
    document.body.innerHTML = '<input aria-label="Date" />'

    const input = screen.getByLabelText<HTMLInputElement>('Date')
    const changes: Array<[string, Event, object]> = []

    new JMask(input, '00/00')

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
    const mask = new JMask(input, '00/00')
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

    mask.destroy()
  })

  test('clears incomplete value on focusout when clearIfNotMatch is enabled', async () => {
    document.body.innerHTML = '<input aria-label="Date" />'

    const input = screen.getByLabelText<HTMLInputElement>('Date')

    new JMask(input, '00/00', { clearIfNotMatch: true })

    await userEvent.setup().type(input, '12')

    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))

    expect(input.value).toBe('')
  })

  test('supports textarea fields', async () => {
    document.body.innerHTML = '<textarea aria-label="Date"></textarea>'

    const input = screen.getByLabelText<HTMLTextAreaElement>('Date')
    const mask = new JMask(input, '00/00')

    await userEvent.setup().type(input, '1205')

    expect(input.value).toBe('12/05')
    expect(mask.clean).toBe('1205')
  })

  test('supports reverse mode for monetary masks', async () => {
    document.body.innerHTML = '<input aria-label="Amount" />'

    const input = screen.getByLabelText<HTMLInputElement>('Amount')
    const mask = new JMask(input, '#.##0,00', { reverse: true })

    await userEvent.setup().type(input, '1234')

    expect(input.value).toBe('12,34')
    expect(mask.clean).toBe('1234')
    expect(mask.test('12,34')).toBe(true)
  })

  test('handles paste for unmasked and masked values', async () => {
    document.body.innerHTML = `
      <input aria-label="Raw" />
      <input aria-label="Masked" />
    `

    const raw = screen.getByLabelText<HTMLInputElement>('Raw')
    const masked = screen.getByLabelText<HTMLInputElement>('Masked')

    new JMask(raw, '00/00')
    new JMask(masked, '00/00')

    const user = userEvent.setup()

    await user.click(raw)
    await user.paste('1205')

    await user.click(masked)
    await user.paste('12/05')

    expect(raw.value).toBe('12/05')
    expect(masked.value).toBe('12/05')
  })

  test('ignores excluded keys and restores the previous value after invalid input', () => {
    document.body.innerHTML = '<input aria-label="Date" />'

    const input = screen.getByLabelText<HTMLInputElement>('Date')
    const mask = new JMask(input, '00/00')
    const changed: string[] = []

    input.focus()
    input.value = '12'
    input.setSelectionRange(2, 2)

    input.addEventListener('jmask:change', (event) => {
      changed.push((event as CustomEvent<[string]>).detail[0])
    })

    mask.prepare(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }))
    input.value = '1'
    input.setSelectionRange(1, 1)
    mask.process(new InputEvent('input', {
      bubbles: true,
      inputType: 'deleteContentBackward',
    }), {})

    expect(input.value).toBe('1')

    mask.prepare(new KeyboardEvent('keydown', { key: 'a', bubbles: true }))
    input.value = '1a'
    input.setSelectionRange(2, 2)
    mask.process(new InputEvent('input', {
      bubbles: true,
      data: 'a',
      inputType: 'insertText',
    }), {})

    expect(input.value).toBe('1')
    expect(input.selectionStart).toBe(1)
    expect(changed).toEqual([])
  })

  test('supports non-field elements and destroy cleanup', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)

    const mask = new JMask(el, '00/00')

    expect(mask.caret).toBe(0)
    mask.caret = 3

    mask.value = '12'
    mask.value = '12'
    expect(el.innerText).toBe('12')

    el.innerText = '12/3'

    expect(mask.value).toBe('12/3')
    expect(mask.clean).toBe('123')
    expect(mask.test('12/3', true)).toBe(true)

    mask.destroy()

    expect(el.innerText).toBe('123')
  })

  test('supports custom descriptors overriding built-in ones', async () => {
    document.body.innerHTML = '<input aria-label="Code" />'

    const input = screen.getByLabelText<HTMLInputElement>('Code')
    const mask = new JMask(input, '0', {
      descriptors: {
        0: { pattern: /[A-Z]/ },
      },
    })

    await userEvent.setup().type(input, 'A')

    expect(input.value).toBe('A')
    expect(mask.test('A')).toBe(true)
  })

  test('does not emit change when processed value stays the same', () => {
    document.body.innerHTML = '<input aria-label="Date" />'

    const input = screen.getByLabelText<HTMLInputElement>('Date')
    const mask = new JMask(input, '00/00')
    const changed: string[] = []

    input.addEventListener('jmask:change', (event) => {
      changed.push((event as CustomEvent<[string]>).detail[0])
    })

    mask.process(new InputEvent('input', {
      bubbles: true,
      inputType: 'insertText',
    }), {})

    expect(changed).toEqual([])
  })

  test('keeps caret stable when mask map entries are after the current caret', () => {
    document.body.innerHTML = '<input aria-label="Date" />'

    const input = screen.getByLabelText<HTMLInputElement>('Date')
    const mask = new JMask(input, '00/00')

    input.focus()

    mask.prepare(new KeyboardEvent('keydown', { key: '3', bubbles: true }))
    input.value = '12/3'
    input.setSelectionRange(1, 1)
    mask.process(new InputEvent('input', {
      bubbles: true,
      data: '3',
      inputType: 'insertText',
    }), {})

    expect(input.selectionStart).toBe(1)
  })

  test('falls back to zero when selectionStart is unavailable', () => {
    document.body.innerHTML = '<input aria-label="Date" />'

    const input = screen.getByLabelText<HTMLInputElement>('Date')
    const mask = new JMask(input, '00/00')

    Object.defineProperty(input, 'selectionStart', {
      configurable: true,
      get: () => null,
    })

    expect(mask.caret).toBe(0)
  })
})
