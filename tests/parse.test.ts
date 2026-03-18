import {
  describe,
  expect,
  test,
} from 'vitest'

import { createParser } from '@/parse'

const parseValue = (value: string, mask: string, reverse = false) => createParser(mask, {
  '0': { pattern: /\d/ },
  '9': { pattern: /\d/, optional: true },
  '#': { pattern: /\d/, recursive: true },
  'A': { pattern: /[a-zA-Z0-9]/ },
  'S': { pattern: /[a-zA-Z]/ },
}, reverse)(value)

describe('parse', () => {
  test.each([
    [['00/00/0000'], '220', { value: '22/0', map: [2] }],
    [['00/00/0000'], '220119', { value: '22/01/19', map: [2, 5] }],
    [['099.099.099.099'], '2552552550', { value: '255.255.255.0', map: [3, 7, 11] }],
    [['099.099.099.099'], '2552', { value: '255.2', map: [3] }],
    [['+7-000-000-00-00'], '905', { value: '+7-905', map: [0, 1, 2] }],
    [['#.##0,00', true], '000', { value: '0,00', map: [1] }],
    [['#.##0,00', true], '0,00', { value: '0,00', map: [1] }],
    [['#.##0,00', true], '99999999,00', { value: '99.999.999,00', map: [4, 6, 10] }],
  ])('valid', (mask, value, expected) => {
    const parsed = parseValue(value, ...(mask as [string, boolean?]))

    expect(parsed.value).toEqual(expected.value)
    expect(parsed.map).toEqual(expected.map)
    expect(parsed.invalid).toEqual([])
  })

  test.each([
    [['00/00/0000'], '2a0119', {
      value: '20/11/9',
      map: [3, 6],
      invalid: [expect.objectContaining({ position: 1, char: 'a' })],
    }],
    [['#.##0,00', true], '0.00', {
      value: '0,00',
      map: [1],
      invalid: [expect.objectContaining({ position: 1, char: '.' })],
    }],
  ])('invalid', (mask, value, expected) => {
    const parsed = parseValue(value, ...(mask as [string, boolean?]))

    expect(parsed.value).toEqual(expected.value)
    expect(parsed.map).toEqual(expected.map)
    expect(parsed.invalid).toEqual(expected.invalid)
  })

  test('fallback', () => {
    const parse = createParser('00f00f0000', {
      0: { pattern: /\d/ },
      f: { pattern: /\//, fallback: '/' },
    })

    const parsed1 = parse('01a012024')

    expect(parsed1.value).toEqual('01/12/4')
    expect(parsed1.map).toEqual([])
    expect(parsed1.invalid).toEqual([])

    const parsed2 = parse('01a01a2024')

    expect(parsed2.value).toEqual('01/12/4')
    expect(parsed2.map).toEqual([])
    expect(parsed2.invalid).toEqual([expect.objectContaining({ position: 5, char: 'a' })])

    const parsed3 = parse('01/01a2024')

    expect(parsed3.value).toEqual('01/01/024')
    expect(parsed3.map).toEqual([])
    expect(parsed3.invalid).toEqual([])

    const parsed4 = parse('01/01aa2024')

    expect(parsed4.value).toEqual('01/01/2024')
    expect(parsed4.map).toEqual([])
    expect(parsed4.invalid).toEqual([])
  })

  test('skips optional descriptors when the next character does not match', () => {
    const parsed = parseValue('1a', '09')

    expect(parsed.value).toEqual('1')
    expect(parsed.map).toEqual([])
    expect(parsed.invalid).toEqual([])
  })

  test('handles recursive descriptor when it is the last mask symbol', () => {
    const parse = createParser('#', {
      '#': { pattern: /\d/, recursive: true },
    })

    const parsed = parse('1234')

    expect(parsed.value).toEqual('1234')
    expect(parsed.map).toEqual([])
    expect(parsed.invalid).toEqual([])
  })

  test('ignores static mask characters typed after the descriptor position', () => {
    const parsed = parseValue('123/4', '00/00')

    expect(parsed.value).toEqual('12/34')
    expect(parsed.map).toEqual([2])
    expect(parsed.invalid).toEqual([])
  })

  test('appends a trailing static mask character when input is shorter by one symbol', () => {
    const parsed = parseValue('12', '00/')

    expect(parsed.value).toEqual('12/')
    expect(parsed.map).toEqual([])
    expect(parsed.invalid).toEqual([])
  })

  test('parses empty input without producing invalid entries', () => {
    const parsed = parseValue('', '00/00')

    expect(parsed.value).toEqual('')
    expect(parsed.map).toEqual([])
    expect(parsed.invalid).toEqual([])
  })

  test('handles multiple optional descriptors in sequence', () => {
    const parsed = parseValue('12', '099')

    expect(parsed.value).toEqual('12')
    expect(parsed.map).toEqual([])
    expect(parsed.invalid).toEqual([])
  })

  test('keeps static-only masks out of empty values', () => {
    const parse = createParser('--', {})

    const parsed = parse('')

    expect(parsed.value).toEqual('')
    expect(parsed.map).toEqual([])
    expect(parsed.invalid).toEqual([])
  })
})
