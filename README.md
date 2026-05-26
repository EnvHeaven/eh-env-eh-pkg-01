<p align="center">
  <a href="https://envheaven.com">
    <img src="./docs/readme/logo/envheaven-logo.png" alt="EnvHeaven" width="96" />
  </a>
</p>

# EnvHeaven package workspace

> Workspace for developing, testing, and publishing the EnvHeaven CLI and plugin packages.

> **Experimental 0.x:** EnvHeaven is currently in experimental `0.x` development. APIs, CLI commands, plugin contracts, package names, and release behavior may change before `1.0.0`. Pin versions and read release notes before using it in production workflows.

## What this repo is

This repository is the EnvHeaven package workspace. It keeps the core CLI package and the first-party plugin packages together for local development and package publishing workflows.

It is maintainer-facing. For the CLI package itself, start with the `envheaven` package README.

## Topology

| Path | Package | Role |
|---|---|---|
| `artifacts/envheaven-pkg-01` | `envheaven` | core CLI, daemon, plugin host, environment resolver |
| `artifacts/envheaven-pkg-plugin-nodejs-pnpm-01` | `@envheaven/plugins-nodejs-pnpm` | pnpm workflow plugin |
| `artifacts/envheaven-pkg-plugin-firebase-hosting-deploy-01` | `@envheaven/plugins-firebase-hosting-deploy` | Firebase Hosting deploy plugin |
| `artifacts/envheaven-pkg-plugin-offiline-web-ui-01` | `@envheaven/plugins-offiline-web-ui` | local Offline Web UI package |
| `artifacts/envheaven-pkg-plugin-aws-s3-cdn-deploy-01` | `@envheaven/plugins-aws-s3-cdn-deploy` | append-only AWS S3 CDN deploy plugin |

The `offiline` spelling is the current real package name for the UI plugin and must be preserved in commands and package references.

## NPM status

Verified public packages:

| Package | Public status |
|---|---|
| `envheaven` | published |
| `@envheaven/plugins-nodejs-pnpm` | published |
| `@envheaven/plugins-firebase-hosting-deploy` | published |
| `@envheaven/plugins-offiline-web-ui` | published |
| `@envheaven/plugins-aws-s3-cdn-deploy` | exists locally, public NPM publication was not verified |

Verified public NPM dist-tags are `latest` and `exp`.

Local version registry tracks may include `exp`, `canary`, `alpha`, `beta`, `rc`, and `release`, but only `latest` and `exp` were verified as public NPM tags.

## Build

```sh
pnpm install
pnpm -r --if-present run build
```

## Test

Each package exposes its own test command when available:

```sh
pnpm -r --if-present test
```

If a broad recursive test is too noisy during local development, run the targeted package tests from the package directory.

## Local package workflow

This workspace is itself an EnvHeaven env repo. Common commands include:

```sh
envheaven deploy local
envheaven deploy local-01
envheaven deploy production
envheaven deploy production-01
envheaven deploy local envheaven
envheaven deploy local plugins-nodejs-pnpm
```

Production package publishing may temporarily rewrite a package `package.json` version, publish, restore the file, and advance the local version registry on success.

## State and secrets

EnvHeaven local state is stored outside the repository, for example:

```txt
~/.local/state/envheaven/state.json
```

Secret env-map layers are intentionally not versioned. Keep real secret files out of Git.

## README assets

README assets for this repo live under:

```txt
docs/readme/
docs/readme/logo/
docs/readme/drafts/
```

The V1 logo source is copied from the Offline Web UI package asset.

## Notes for maintainers

- Do not claim `1.0.0` stability while the package family is still `0.x`.
- Do not add CI badges unless workflows exist.
- Do not claim AWS S3 plugin NPM availability until registry publication is verified.
- Keep package READMEs concise enough for both GitHub and NPM.

## License

Package manifests declare MIT. Add a root license file before linking to one from public READMEs.
