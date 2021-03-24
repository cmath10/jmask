import JMask from '../src/jmask';

(() => {
  const masks = [
    {
      id: 'cep',
      mask: '00000-000',
      options: {
        onComplete (value) {
          alert('CEP Completed!: ' + value)
        },
        onChange (value) {
          console.log('CEP changed!: ', value)
        },
        onInvalid (value, event, el, invalid) {
          const error = invalid[0]
          console.log('Digit: ', error.char, ' is invalid for the position: ', error.position, '. We expect something like: ', error.pattern)
        },
      },
    },
    { id: 'date', mask: '00/00/0000' },
    { id: 'date-clear', mask: '00/00/0000', options: { clearIfNotMatch: true } },
    {
      id: 'date-fallback',
      mask: '00r00r0000',
      options: {
        translations: {
          'r': { pattern: /./, fallback: '/' },
        },
      },
    },
    {
      id: 'ip',
      mask: '0ZZ.0ZZ.0ZZ.0ZZ',
      options: {
        translations: {
          'Z': { pattern: /[0-9]/, optional: true },
        },
      },
    },
    { id: 'money', mask: '#.##0,00', options: { reverse: true } },
    { id: 'percent', mask: '##0,00%', options: { reverse: true } },
    { id: 'phone', mask: '+7-000-000-00-00' },
    { id: 'time', mask: '00:00:00' },
  ].map(({ id, mask, options }) => {
    const el = document.getElementById(id)
    return new JMask(el, mask, options)
  })

  window.addEventListener('beforeunload', () => {
    masks.forEach(mask => {
      mask.destroy()
    })
  })
})()
