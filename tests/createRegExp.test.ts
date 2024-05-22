import {
  describe,
  expect,
  test,
} from 'vitest'

import createRegExp from '@/createRegExp'

const createTestRegex = (mask: string) => createRegExp(mask, {
  '0': { pattern: /\d/ },
  '9': { pattern: /\d/, optional: true },
  '#': { pattern: /\d/, recursive: true },
  'A': { pattern: /[a-zA-Z0-9]/ },
  'S': { pattern: /[a-zA-Z]/ },
})

describe('createRegExp', () => {
  test('dates', () => {
    const regex = createTestRegex('00/00/0000')

    expect(regex.test('01/01/1970')).toBeTruthy()
    expect(regex.test('01/**/1970')).toBeFalsy()
  })

  test('ip', () => {
    const regex = createTestRegex('099.099.099.099')

    expect(regex.test('255.255.255.0')).toBeTruthy()
    expect(regex.test('192.168.0.0')).toBeTruthy()
    expect(regex.test('127.0.0.1')).toBeTruthy()
  })

  test('money', () => {
    const regex = createTestRegex('#.##0,00')

    expect(regex.test('0,00')).toBeTruthy()
    expect(regex.test('0,aa')).toBeFalsy()
  })

  test('numbers', () => {
    const regex = createTestRegex('000000')

    expect(regex.test('12345')).toBeFalsy()
    expect(regex.test('1234567')).toBeTruthy()
    expect(regex.test('1234567')).toBeTruthy()
    expect(regex.test('1.')).toBeFalsy()
    expect(regex.test('1éáa2aaaaqwo')).toBeFalsy()
  })

  test('phones', () => {
    const regex = createTestRegex('+7-000-000-00-00')

    expect(regex.test('+7-999-999-99-99')).toBeTruthy()
    expect(regex.test('+7-a99-bc9-99-99')).toBeFalsy()
  })
})
