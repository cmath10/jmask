import { mkdir, rm } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'

const rawDir = path.join('.nyc_output', 'raw')
const mergedDir = path.join('.nyc_output', 'merged')
const mergedFile = path.join(mergedDir, 'coverage-final.json')
const nycCli = path.join('node_modules', 'nyc', 'bin', 'nyc.js')

await rm(mergedDir, { recursive: true, force: true })
await mkdir(mergedDir, { recursive: true })

const merge = spawnSync(process.execPath, [nycCli, 'merge', rawDir, mergedFile], {
  stdio: 'inherit',
})

if (merge.status !== 0) {
  process.exit(merge.status ?? 1)
}

const report = spawnSync(process.execPath, [nycCli, 'report'], {
  stdio: 'inherit',
})

if (report.status !== 0) {
  process.exit(report.status ?? 1)
}
