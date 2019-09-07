export interface JMaskOptions {
    clearIfNotMatch?: boolean,
    keysExcluded?: object,
    reverse?: boolean,
    translations?: object,
}

export interface JMaskTranslation {
    pattern: RegExp,
    fallback?: string,
    optional?: boolean,
    recursive?: boolean,
}
