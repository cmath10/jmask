import { rm } from 'node:fs/promises'

const paths = [
  'coverage',
  '.nyc_output',
]

await Promise.all(paths.map(path => rm(path, {
  recursive: true,
  force: true,
})))
