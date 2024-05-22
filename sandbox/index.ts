import JMask from '../src/JMask'

(() => {
  const masks: JMask[] = []

  const cep = document.getElementById('cep')

  masks.push(new JMask(cep, '00000-000'))

  const onEvent = (event: Event) => {
    if ('detail' in event) {
      console.log(event.type, event.detail)
    }
  }

  cep.addEventListener('jmask:change', onEvent)
  cep.addEventListener('jmask:complete', onEvent)

  masks.push(new JMask(document.getElementById('date'), '00/00/0000'))
  masks.push(new JMask(document.getElementById('date-clear'), '00/00/0000', { clearIfNotMatch: true }))
  masks.push(new JMask(document.getElementById('date-fallback'), '00r00r0000', {
    descriptors: {
      r: { pattern: /\//, fallback: '/' },
    },
  }))

  masks.push(new JMask(document.getElementById('ip'), '0ZZ.0ZZ.0ZZ.0ZZ', {
    descriptors: {
      Z: { pattern: /[0-9]/, optional: true },
    },
  }))

  masks.push(new JMask(document.getElementById('money'), '#.##0,00', { reverse: true }))
  masks.push(new JMask(document.getElementById('percent'), '##0,00%', { reverse: true }))
  masks.push(new JMask(document.getElementById('phone'), '+7-000-000-00-00'))
  masks.push(new JMask(document.getElementById('time'), '00:00:00'))

  window.addEventListener('beforeunload', () => {
    masks.forEach(mask => mask.destroy())
  })
})()
