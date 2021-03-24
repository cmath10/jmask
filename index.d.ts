export interface JMask {
    constructor (el: Element|HTMLElement|HTMLInputElement, mask: string, options: JMaskOptions),
    getClean (): string,
    getMasked (skipMaskChars: boolean): string,
    destroy (): void,
}

export interface JMaskOptions {
    clearIfNotMatch?: boolean,
    keysExcluded?: number[],
    reverse?: boolean,
    translations?: Record<string, JMaskTranslation>,
}

export interface JMaskTranslation {
    pattern: RegExp,
    fallback?: string,
    optional?: boolean,
    recursive?: boolean,
}
