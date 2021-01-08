import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

// noinspection JSUnusedGlobalSymbols
export default {
    input: 'src/jmask.js',
    output: {
        name: 'JMask',
        exports: 'default',
        format: 'iife',
    },
    plugins: [
        resolve({
            browser: true,
            preferBuiltins: false,
        }),
        alias({ entries: [{ find: /^@\/(.+)/, replacement: './$1' }] }),
        commonjs(),
        terser(),
    ],
};
