export default interface JMask {
    constructor (el: Element|HTMLElement|HTMLInputElement, mask: string, options: JMaskOptions),
    getClean (): string,
    getMasked (skipMaskChars: boolean): string,
    destroy (): void,
}

export type JMaskOptions = {
    clearIfNotMatch?: boolean,
    keysExcluded?: number[],
    reverse?: boolean,
    translations?: Record<string, JMaskTranslation>,
}

export type JMaskTranslation = {
    pattern: RegExp,
    fallback?: string,
    optional?: boolean,
    recursive?: boolean,
}
