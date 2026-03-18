import {
  mask,
  unmask,
} from '@/mask'

(() => {
  const masked: HTMLElement[] = []

  const applyMask = (el: HTMLElement, pattern: string, options = {}) => {
    mask(el, pattern, options)
    masked.push(el)
  }

  const cep = document.getElementById('cep') as HTMLElement

  applyMask(cep, '00000-000')

  const onEvent = (event: Event) => {
    if ('detail' in event) {
      console.log(event.type, event.detail)
    }
  }

  cep.addEventListener('jmask:change', onEvent)
  cep.addEventListener('jmask:complete', onEvent)

  applyMask(document.getElementById('date') as HTMLElement, '00/00/0000')
  applyMask(document.getElementById('date-clear') as HTMLElement, '00/00/0000', { clearIfNotMatch: true })
  applyMask(document.getElementById('date-fallback') as HTMLElement, '00r00r0000', {
    descriptors: {
      r: { pattern: /\//, fallback: '/' },
    },
  })

  applyMask(document.getElementById('ip') as HTMLElement, '0ZZ.0ZZ.0ZZ.0ZZ', {
    descriptors: {
      Z: { pattern: /[0-9]/, optional: true },
    },
  })

  applyMask(document.getElementById('money') as HTMLElement, '#.##0,00', { reverse: true })
  applyMask(document.getElementById('percent') as HTMLElement, '##0,00%', { reverse: true })
  applyMask(document.getElementById('phone') as HTMLElement, '+7-000-000-00-00')
  applyMask(document.getElementById('time') as HTMLElement, '00:00:00')

  window.addEventListener('beforeunload', () => {
    masked.forEach(unmask)
  })
})()
