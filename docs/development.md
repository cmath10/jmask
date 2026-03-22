# Development

## Requirements

* Node.js >= 20.19.x for local development
* Docker with Docker Compose for containerized commands from `Makefile`

CI release jobs currently use Node.js 24.

## Setup

Install dependencies locally:

```bash
yarn install
```

Install dependencies in the node container:

```bash
make node_modules
```

## Quality checks

Run ESLint locally:

```bash
yarn lint
```

Run ESLint in containers:

```bash
make lint
```

Run TypeScript typecheck locally:

```bash
yarn typecheck
```

Run TypeScript typecheck in containers:

```bash
make typecheck
```

## Tests

Run all tests locally:

```bash
yarn test
```

Run unit tests only:

```bash
yarn test:unit
make test-unit
```

Run E2E tests only:

```bash
yarn test:e2e
make test-e2e
```

Run the full suite in containers:

```bash
make test
```

## Coverage

Run unit, E2E, and merged V8 coverage locally:

```bash
yarn coverage
```

Run a single coverage suite locally:

```bash
yarn coverage:unit
yarn coverage:e2e
```

Run coverage in containers:

```bash
make coverage
make coverage-unit
make coverage-e2e
make coverage-merge
```

## Build

Build the package locally:

```bash
yarn build
```

Build the package in containers:

```bash
make build
```

## Sandbox

Run the local sandbox for visual checks:

```bash
yarn sandbox:serve
```
