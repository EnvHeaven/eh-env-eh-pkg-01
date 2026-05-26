<br />

<p align="center">
  <a href="https://envheaven.com">
    <img src="./docs/readme/logo/envheaven-logo.svg" alt="EnvHeaven" width="96" />
  </a>

  <h1 align="center">EnvHeaven AWS S3 CDN Deploy Plugin</h1>

  <p align="center">
    Environment hell, inverted.
  </p>

  <p align="center">
    <a href="#install">Install</a>
    ·
    <a href="#usage">Usage</a>
    ·
    <a href="#release-channels">Release Channels</a>
  </p>
</p>

<div align="center">

[![npm](https://img.shields.io/npm/v/@envheaven/plugins-aws-s3-cdn-deploy)](https://www.npmjs.com/package/@envheaven/plugins-aws-s3-cdn-deploy)
[![license](https://img.shields.io/npm/l/@envheaven/plugins-aws-s3-cdn-deploy)](#license)
[![plugin](https://img.shields.io/badge/envheaven-plugin-blue)](#usage)
[![AWS S3](https://img.shields.io/badge/deploy-AWS%20S3-orange)](#requirements)
[![status](https://img.shields.io/badge/status-experimental%200.x-orange)](#experimental-0x)

</div>

> **Experimental 0.x:** EnvHeaven is currently in experimental `0.x` development. APIs, CLI commands, plugin contracts, package names, and release behavior may change before `1.0.0`. Pin versions and read release notes before using it in production workflows.

## Install

| Channel | Install | Purpose |
|---|---|---|
| `release` | `npm install @envheaven/plugins-aws-s3-cdn-deploy@release` | recommended 0.x release track after publication |
| `latest` | `npm install @envheaven/plugins-aws-s3-cdn-deploy` | npm default alias for the release track after publication |
| `exp` | `npm install @envheaven/plugins-aws-s3-cdn-deploy@exp` | experimental builds with newer changes after publication |

Install compatible `envheaven` host package in the same workflow.

## Usage

Deploy static CDN files to S3 with append-only safety rules.

```jsonc
{
  "pluginPackage": "@envheaven/plugins-aws-s3-cdn-deploy",
  "Execution": {
    "cwd": "."
  }
}
```

## What it does

- local file scanning.
- remote S3 object listing.
- diff/inspect flows.
- deploy additions only.
- collision blocking.

## Requirements

Node.js `>=20`, EnvHeaven host package, AWS credentials, and an existing S3 bucket/prefix.

## Release Channels

| Channel | Install | Purpose |
|---|---|---|
| `release` | `npm install @envheaven/plugins-aws-s3-cdn-deploy@release` | recommended 0.x release track after publication |
| `latest` | `npm install @envheaven/plugins-aws-s3-cdn-deploy` | npm default alias for the release track after publication |
| `exp` | `npm install @envheaven/plugins-aws-s3-cdn-deploy@exp` | experimental builds with newer changes after publication |

`release` is the recommended 0.x track, not a stable API promise.
This package is prepared for publication, but current registry verification did not find it on NPM.


## Status

Experimental. Plugin contracts may change before EnvHeaven `1.0.0`.

## License

MIT, as declared in `package.json`.
