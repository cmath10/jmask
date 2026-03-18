import { copyFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const suite = process.argv[2]

if (suite !== 'unit' && suite !== 'e2e') {
  throw new Error('Coverage suite must be "unit" or "e2e"')
}

const source = path.join('coverage', suite, 'coverage-final.json')
const targetDir = path.join('.nyc_output', 'raw')
const target = path.join(targetDir, `${suite}.json`)

await mkdir(targetDir, { recursive: true })
await copyFile(source, target)
