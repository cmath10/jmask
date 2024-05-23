import {
  describe,
  expect,
  test,
} from 'vitest'

import Parser from '@/Parser'

const parse = (value: string, mask: string, reverse = false) => new Parser(mask, {
  '0': { pattern: /\d/ },
  '9': { pattern: /\d/, optional: true },
  '#': { pattern: /\d/, recursive: true },
  'A': { pattern: /[a-zA-Z0-9]/ },
  'S': { pattern: /[a-zA-Z]/ },
}, reverse).parse(value)

describe('Parser', () => {
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
    const parsed = parse(value, ...(mask as [string, boolean?]))

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
    const parsed = parse(value, ...(mask as [string, boolean?]))

    expect(parsed.value).toEqual(expected.value)
    expect(parsed.map).toEqual(expected.map)
    expect(parsed.invalid).toEqual(expected.invalid)
  })

  test('fallback', () => {
    const parser = new Parser('00f00f0000', {
      0: { pattern: /\d/ },
      f: { pattern: /\//, fallback: '/' },
    })

    const parsed1 = parser.parse('01a012024')

    expect(parsed1.value).toEqual('01/12/4')
    expect(parsed1.map).toEqual([])
    expect(parsed1.invalid).toEqual([])

    const parsed2 = parser.parse('01a01a2024')

    expect(parsed2.value).toEqual('01/12/4')
    expect(parsed2.map).toEqual([])
    expect(parsed2.invalid).toEqual([expect.objectContaining({ position: 5, char: 'a' })])

    const parsed3 = parser.parse('01/01a2024')

    expect(parsed3.value).toEqual('01/01/024')
    expect(parsed3.map).toEqual([])
    expect(parsed3.invalid).toEqual([])

    const parsed4 = parser.parse('01/01aa2024')

    expect(parsed4.value).toEqual('01/01/2024')
    expect(parsed4.map).toEqual([])
    expect(parsed4.invalid).toEqual([])
  })
})
