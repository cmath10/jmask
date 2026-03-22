# Release

## GitHub Actions workflow

Run the `Release` workflow from GitHub Actions with these inputs:

```bash
release: auto | patch | minor | major
npm_tag: latest | <custom dist-tag>
```

If `npm_tag=latest`, the workflow must be started from the `master` branch.

## What the workflow does

The workflow:

* checks out the repository with full git history;
* sets up Node.js 24;
* prepares the project environment via `.github/actions/setup`;
* runs `make lint`, `make typecheck`, and `make test`;
* runs one of `yarn release`, `yarn release:patch`, `yarn release:minor`, or `yarn release:major`;
* builds the package with `make build`;
* pushes the release commit and tags back to the source branch;
* publishes the package to npm with the selected dist-tag.

## npm publishing

Publishing is done through npm Trusted Publishing, without npm tokens in the repository. The trusted publisher must be configured on npm for the GitHub Actions workflow file `.github/workflows/release.yml`.
