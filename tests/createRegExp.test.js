import { expect } from 'chai'
import createRegex from '@/createRegExp'

const createTestRegex = mask => createRegex(mask, {
  '0': { pattern: /\d/ },
  '9': { pattern: /\d/, optional: true },
  '#': { pattern: /\d/, recursive: true },
  'A': { pattern: /[a-zA-Z0-9]/ },
  'S': { pattern: /[a-zA-Z]/ },
})

describe('JMaskRegex', () => {
  it ('dates', () => {
    const regex = createTestRegex('00/00/0000')

    expect(regex.test('01/01/1970'), 'Correct').to.be.true
    expect(regex.test('01/**/1970'), 'Incorrect').to.be.false
  })

  it ('ip', () => {
    const regex = createTestRegex('099.099.099.099')

    expect(regex.test('255.255.255.0'), 'Correct').to.be.true
    expect(regex.test('192.168.0.0'), 'Correct').to.be.true
    expect(regex.test('127.0.0.1'), 'Correct').to.be.true
  })

  it ('money', () => {
    const regex = createTestRegex('#.##0,00')

    expect(regex.test('0,00'), 'Correct').to.be.true
    expect(regex.test('0,aa'), 'Incorrect').to.be.false
  })

  it ('numbers', () => {
    const regex = createTestRegex('000000')

    expect(regex.test('12345'), 'Incorrect').to.be.false
    expect(regex.test('1234567'), 'Correct').to.be.true
    expect(regex.test('1234567'), 'Correct').to.be.true
    expect(regex.test('1.'), 'Incorrect').to.be.false
    expect(regex.test('1éáa2aaaaqwo'), 'Incorrect').to.be.false
  })

  it ('phones', () => {
    const regex = createTestRegex('+7-000-000-00-00')

    expect(regex.test('+7-999-999-99-99'), 'Correct').to.be.true
    expect(regex.test('+7-a99-bc9-99-99'), 'Incorrect').to.be.false
  })
})
