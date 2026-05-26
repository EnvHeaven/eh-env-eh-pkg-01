<br />

<p align="center">
  <a href="https://envheaven.com">
    <img src="./docs/readme/logo/envheaven-logo.svg" alt="EnvHeaven" width="96" />
  </a>

  <h1 align="center">EnvHeaven Package Workspace</h1>

  <p align="center">
    Environment hell, inverted.
  </p>

  <p align="center">
    <a href="#quick-start">Quick Start</a>
    ·
    <a href="#packages">Packages</a>
    ·
    <a href="#release-channels">Release Channels</a>
  </p>
</p>

<div align="center">

[![workspace](https://img.shields.io/badge/workspace-pnpm-blue)](#packages)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6)](#technology)
[![status](https://img.shields.io/badge/status-experimental%200.x-orange)](#experimental-0x)
[![channels](https://img.shields.io/badge/channels-release%20%7C%20latest%20%7C%20exp-blue)](#release-channels)

</div>

> **Experimental 0.x:** EnvHeaven is currently in experimental `0.x` development. APIs, CLI commands, plugin contracts, package names, and release behavior may change before `1.0.0`. Pin versions and read release notes before using it in production workflows.

## Quick Start

```sh
pnpm install
pnpm -r --if-present run build
pnpm -r --if-present test
```

## What it is

This repository is the maintainer workspace for the EnvHeaven package family. It contains the core CLI package and first-party plugins.

## Packages

| Package | Registry status | Purpose |
|---|---|---|
| `envheaven` | published | CLI, daemon, plugin host, environment resolution |
| `@envheaven/plugins-nodejs-pnpm` | published | pnpm-backed Node.js workflow plugin |
| `@envheaven/plugins-firebase-hosting-deploy` | published | Firebase Hosting deploy plugin |
| `@envheaven/plugins-offline-web-ui` | prepared; not verified on NPM | local Offline Web UI package |
| `@envheaven/plugins-aws-s3-cdn-deploy` | prepared; not verified on NPM | append-only AWS S3 CDN deploy plugin |

## Release Channels

Public packages are prepared for these channels:

| Channel | Install | Purpose |
|---|---|---|
| `release` | `npm install PACKAGE@release` | recommended 0.x release track |
| `latest` | `npm install PACKAGE` | npm default alias for the release track |
| `exp` | `npm install PACKAGE@exp` | experimental builds with newer changes |

`release` is the recommended 0.x track, not a stable API promise. Current registry verification confirms `latest` and `exp`; `release` remains a publish target until verified.

## Notes

- Real package source lives under `artifacts/`.
- README assets live under `docs/readme/`.
- `@envheaven/plugins-offline-web-ui` is the active target package name; the physical folder still contains `offiline` until repo rename work happens.
- Do not treat this workspace as production-stable before `1.0.0`.

## License

Package manifests declare MIT.
