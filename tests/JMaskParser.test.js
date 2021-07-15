import { expect } from 'chai'
import JMaskParser from '@/JMaskParser'

const createParser = (mask, reverse = false) => new JMaskParser(mask, {
  '0': { pattern: /\d/ },
  '9': { pattern: /\d/, optional: true },
  '#': { pattern: /\d/, recursive: true },
  'A': { pattern: /[a-zA-Z0-9]/ },
  'S': { pattern: /[a-zA-Z]/ },
}, reverse)

const expectValue = ({ value }, expected) => expect(value).to.be.string(expected)
const expectMap = ({ map }, expected) => expect(map, 'Correct char positions').to.be.deep.equal(expected)

const expectAllCharsValid = (info, { value, map }) => {
  expectValue(info, value)
  expectMap(info, map)
  expect(info.invalid.length, 'No invalid chars').to.be.equal(0)
}

describe ('JMaskParser', () => {
  describe ('Dates: 00/00/0000', () => {
    const parser = createParser('00/00/0000')

    it ('220', () => {
      expectAllCharsValid(parser.parse('220'), { value: '22/0', map: [2] })
    })

    it ('220119', () => {
      expectAllCharsValid(parser.parse('220119'), { value: '22/01/19', map: [2, 5] })
    })

    it ('2a0119', () => {
      const info = parser.parse('2a0119')

      expectValue(info, '20/11/9')
      expectMap(info, [3, 6])
      expect(info.invalid.length, '1 invalid char').to.be.equal(1)
      expect(info.invalid[0], 'Correct keys').to.have.keys([
        'position',
        'char',
        'pattern',
      ])
      expect(info.invalid[0].position, 'Correct position of invalid char').to.be.equal(1)
      expect(info.invalid[0].char, 'Correct value of invalid char').to.be.string('a')
    })
  })

  describe ('IP: 099.099.099.099', () => {
    const parser = createParser('099.099.099.099')

    it ('2552552550', () => {
      expectAllCharsValid(parser.parse('2552552550'), { value: '255.255.255.0', map: [3, 7, 11] })
    })

    it ('2552', () => {
      expectAllCharsValid(parser.parse('2552'), { value: '255.2', map: [3] })
    })
  })

  describe ('money: #.##0,00', () => {
    const parser = createParser('#.##0,00', true)

    it ('000', () => {
      expectAllCharsValid(parser.parse('000'), { value: '0,00', map: [1] })
    })

    it ('0.00', () => {
      const info = parser.parse('0.00')

      expectValue(info, '0,00')
      expectMap(info, [1])
      expect(info.invalid.length, '1 invalid char').to.be.equal(1)
      expect(info.invalid[0], 'Correct keys').to.have.keys([
        'position',
        'char',
        'pattern',
      ])
      expect(info.invalid[0].position, 'Correct position of invalid char').to.be.equal(1)
      expect(info.invalid[0].char, 'Correct value of invalid char').to.be.string('.')
    })

    it ('0,00', () => {
      expectAllCharsValid(parser.parse('0,00'), { value: '0,00', map: [1] })
    })

    it ('99999999,00', () => {
      expectAllCharsValid(parser.parse('99999999,00'), { value: '99.999.999,00', map: [4, 6, 10] })
    })
  })

  describe ('phones: +7-000-000-00-00', () => {
    const parser = createParser('+7-000-000-00-00')

    it ('905', () => {
      expectAllCharsValid(parser.parse('905'), { value: '+7-905', map: [0, 1, 2] })
    })
  })
})
