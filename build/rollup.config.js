import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import { terser } from 'rollup-plugin-terser'

// noinspection JSUnusedGlobalSymbols
export default {
    input: 'src/jmask.js',
    output: [{
        name: 'JMask',
        exports: 'default',
        sourcemap: false,
    }],
    plugins: [
        alias({ entries: [{ find: /^@\/(.+)/, replacement: './$1' }] }),
        commonjs(),
        terser(),
    ],
}
