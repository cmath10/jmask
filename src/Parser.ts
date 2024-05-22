import type {
  Descriptor,
  Invalid,
  Parsed,
} from '@/types'

const put = (buffer: string[], char: string, reverse: boolean) => reverse
  ? buffer.unshift(char)
  : buffer.push(char)

type Conveyor = {
  forward (): void
  back (): void
  char (): string
  last (): number
  getPosition (): number
  setPosition (position: number): void
  on (position: number): boolean
  offset (): number
  ended (): boolean
}

const conveyor = (value: string, reverse: boolean): Conveyor => {
  const _offset = reverse ? -1 : 1
  let _position = reverse ? value.length - 1 : 0

  return {
    forward: () => { _position += _offset },
    back: () => { _position -= _offset },
    char: () => value.charAt(_position),
    last: () => reverse ? 0 : value.length - 1,
    getPosition: () => _position,
    setPosition: (position: number) => { _position = position },
    on: (position: number) => _position === position,
    offset: () => _offset,
    ended: () => reverse ? _position <= -1 : _position >= value.length,
  }
}

export default class Parser {
  public readonly mask: string
  public readonly descriptors: Record<string, Descriptor>
  public readonly reverse: boolean

  constructor(
    mask: string,
    descriptors: Record<string, Descriptor>,
    reverse: boolean = false
  ) {
    this.mask = mask
    this.reverse = reverse
    this.descriptors = descriptors
  }

  parse(
    raw: string,
    skipMaskChars = false
  ): Parsed {
    const buffer: string[] = []
    const reverse = this.reverse
    const invalid: Invalid[] = []

    const mask = conveyor(this.mask, this.reverse)
    const value = conveyor(raw, this.reverse)

    let rewindPosition = -1
    let charCount = 0
    const maskCharsPositions: number[] = []

    let lastStaticMaskChar: string | undefined = undefined

    while (!mask.ended() && !value.ended()) {
      const descriptor = this.descriptors[mask.char()]

      if (descriptor) {
        if (value.char().match(descriptor.pattern)) {
          put(buffer, value.char(), reverse)

          if (descriptor.recursive) {
            if (rewindPosition === -1) {
              rewindPosition = mask.getPosition()
            } else if (rewindPosition !== mask.last() && mask.on(mask.last())) {
              mask.setPosition(rewindPosition - mask.offset())
            }

            if (rewindPosition === mask.last()) {
              continue
            }
          }

          mask.forward()
        } else if (value.char() === lastStaticMaskChar) {
          charCount--
          lastStaticMaskChar = undefined
        } else if (descriptor.optional) {
          mask.forward()
          value.back()
        } else if (descriptor.fallback) {
          put(buffer, descriptor.fallback, reverse)
          mask.forward()
          value.forward()
        } else {
          invalid.push({
            position: value.getPosition(),
            char: value.char(),
            pattern: descriptor.pattern,
          })
        }

        value.forward()
      } else {
        if (!skipMaskChars) {
          put(buffer, mask.char(), reverse)
        }

        if (value.char() === mask.char()) {
          maskCharsPositions.push(value.getPosition())
          value.forward()
        } else {
          lastStaticMaskChar = mask.char()
          maskCharsPositions.push(value.getPosition() + charCount)
          charCount++
        }

        mask.forward()
      }
    }

    const lastMaskChar = this.mask.charAt(mask.last())

    if (this.mask.length === raw.length + 1 && !this.descriptors[lastMaskChar]) {
      buffer.push(lastMaskChar)
    }

    const diff = reverse ? buffer.length - raw.length : 0
    const positions = maskCharsPositions.map(p => p + diff)

    return {
      value: buffer.join(''),
      map: reverse ? positions.reverse() : positions,
      invalid,
    }
  }
}
