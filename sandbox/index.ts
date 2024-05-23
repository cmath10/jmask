import JMask from '@/JMask'

(() => {
  const masks: JMask[] = []

  const cep = document.getElementById('cep') as HTMLElement

  masks.push(new JMask(cep, '00000-000'))

  const onEvent = (event: Event) => {
    if ('detail' in event) {
      console.log(event.type, event.detail)
    }
  }

  cep.addEventListener('jmask:change', onEvent)
  cep.addEventListener('jmask:complete', onEvent)

  masks.push(new JMask(document.getElementById('date') as HTMLElement, '00/00/0000'))
  masks.push(new JMask(document.getElementById('date-clear') as HTMLElement, '00/00/0000', { clearIfNotMatch: true }))
  masks.push(new JMask(document.getElementById('date-fallback') as HTMLElement, '00r00r0000', {
    descriptors: {
      r: { pattern: /\//, fallback: '/' },
    },
  }))

  masks.push(new JMask(document.getElementById('ip') as HTMLElement, '0ZZ.0ZZ.0ZZ.0ZZ', {
    descriptors: {
      Z: { pattern: /[0-9]/, optional: true },
    },
  }))

  masks.push(new JMask(document.getElementById('money') as HTMLElement, '#.##0,00', { reverse: true }))
  masks.push(new JMask(document.getElementById('percent') as HTMLElement, '##0,00%', { reverse: true }))
  masks.push(new JMask(document.getElementById('phone') as HTMLElement, '+7-000-000-00-00'))
  masks.push(new JMask(document.getElementById('time') as HTMLElement, '00:00:00'))

  window.addEventListener('beforeunload', () => {
    masks.forEach(mask => mask.destroy())
  })
})()
