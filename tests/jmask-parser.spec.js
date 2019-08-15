import { expect } from 'chai';
import JMaskParser from '../src/jmask-parser';

describe ('JMaskParser', () => {
  describe ('Dates: 00/00/0000', () => {
    const parser = new JMaskParser('00/00/0000');

    it ('220', () => {
      const info = parser.parse('220');

      expect(info.buffer.toString()).to.be.string('22/0');
      expect(info.invalid.length, 'No invalid chars').to.be.equal(0);
      expect(info.map, 'Correct char positions').to.be.deep.equal({2: 1});
    });

    it ('220119', () => {
      const info = parser.parse('220119');

      expect(info.buffer.toString()).to.be.string('22/01/19');
      expect(info.invalid.length, 'No invalid chars').to.be.equal(0);
      expect(info.map, 'Correct char positions').to.be.deep.equal({2: 1, 5: 1});
    });

    it ('2a0119', () => {
      const info = parser.parse('2a0119');

      expect(info.buffer.toString()).to.be.string('20/11/9');
      expect(info.invalid.length, '1 invalid char').to.be.equal(1);
      expect(info.invalid[0], 'Correct keys').to.have.keys([
        'position',
        'char',
        'pattern',
      ]);
      expect(info.invalid[0].position, 'Correct position of invalid char').to.be.equal(1);
      expect(info.invalid[0].char, 'Correct value of invalid char').to.be.string('a');
      expect(info.map, 'Correct char positions').to.be.deep.equal({3: 1, 6: 1});
    });
  });

  describe ('Money: #.##0,00', () => {
    const parser = new JMaskParser('#.##0,00');

    it ('000', () => {
      const info = parser.parse('000');

      expect(info.buffer.toString()).to.be.string('0.00');
      expect(info.invalid.length, 'No invalid chars').to.be.equal(0);
      expect(info.map, 'Correct char positions').to.be.deep.equal({1: 1});
    });

    it ('0.00', () => {
      const info = parser.parse('0.00');

      expect(info.buffer.toString()).to.be.string('0.00');
      expect(info.invalid.length, 'No invalid chars').to.be.equal(0);
      expect(info.map, 'Correct char positions').to.be.deep.equal({1: 1});
    });

    it ('0,00', () => {
      const info = parser.parse('0,00');

      expect(info.buffer.toString()).to.be.string('0.00');
      expect(info.invalid.length, '1 invalid char').to.be.equal(1);
      expect(info.invalid[0], 'Correct keys').to.have.keys([
        'position',
        'char',
        'pattern',
      ]);
      expect(info.invalid[0].position, 'Correct position of invalid char').to.be.equal(1);
      expect(info.invalid[0].char, 'Correct value of invalid char').to.be.string(',');
      expect(info.map, 'Correct char positions').to.be.deep.equal({1: 1});
    });
  });
});