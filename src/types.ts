export type Descriptor = {
  pattern: RegExp
  fallback?: string
  optional?: boolean
  recursive?: boolean
}

export type Invalid = {
  position: number
  char: string
  pattern: RegExp
}

export type Parsed = {
  value: string
  map: number[]
  invalid: Invalid[]
}

export type Options = {
  clearIfNotMatch?: boolean
  descriptors?: Record<string, Descriptor>
  exclude?: KeyboardEvent['key'][]
  reverse?: boolean
}
