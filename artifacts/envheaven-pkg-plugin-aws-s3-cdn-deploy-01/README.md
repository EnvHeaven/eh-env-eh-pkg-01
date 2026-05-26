<p align="center">
  <a href="https://envheaven.com">
    <img src="./docs/readme/logo/envheaven-logo.png" alt="EnvHeaven" width="96" />
  </a>
</p>

# @envheaven/plugins-aws-s3-cdn-deploy

> Local EnvHeaven plugin for append-only AWS S3 CDN deployment workflows.

> **Experimental 0.x:** EnvHeaven is currently in experimental `0.x` development. APIs, CLI commands, plugin contracts, package names, and release behavior may change before `1.0.0`. Pin versions and read release notes before using it in production workflows.

> This plugin exists in the repository, but public NPM publication was not verified in the current consolidate.

## What it does

This plugin compares a local static directory with an S3 prefix and deploys only safe additions.

It supports:

- local file scanning.
- remote S3 object listing.
- diff/inspect flows.
- append-only deploys.
- clone/pull from S3 to a local folder.
- blocking collisions where a local file would overwrite a different remote object.

The plugin is designed to avoid destructive CDN deploy behavior.

## Install

Public NPM publication was not verified for this package.

Use it from the local workspace until package publication status is confirmed:

```sh
pnpm install
pnpm --filter @envheaven/plugins-aws-s3-cdn-deploy run build
```

Do not assume this command works from the public registry yet:

```sh
# not verified on NPM
npm install @envheaven/plugins-aws-s3-cdn-deploy
```

## Use

Example EnvHeaven execution metadata can point at the local package:

```jsonc
{
  "pluginPackage": "@envheaven/plugins-aws-s3-cdn-deploy",
  "Execution": {
    "cwd": ".",
    "env": {
      "ENVHEAVEN_S3_CDN_LOCAL_DIR": "public",
      "AWS_REGION": "sa-east-1",
      "AWS_S3_BUCKET": "my-cdn-bucket",
      "AWS_S3_PREFIX": "site"
    }
  }
}
```

Supported action argument examples:

```sh
envheaven deploy local
envheaven deploy production
```

The resolved execution can use plugin arguments such as `deploy`, `diff`, `inspect`, `clone`, or `pull`.

## Safety model

- No remote deletes.
- No overwriting remote keys with different local content.
- Collision diagnostics block deploy.
- Remote-only objects are reported as drift, not deleted.

## Requirements

- Node.js `>=20`.
- EnvHeaven host package.
- AWS credentials configured in the execution environment.
- S3 bucket and prefix configured for the target workflow.
- Local static directory available before deploy.

## Current limitations

- Public NPM package availability was not verified.
- This is not a build pipeline; build steps belong in other plugins or commands.
- This is not a full CDN invalidation/orchestration tool.
- Plugin contracts may change before EnvHeaven `1.0.0`.

## Related

- [`envheaven`](https://www.npmjs.com/package/envheaven)
- [`@envheaven/plugins-nodejs-pnpm`](https://www.npmjs.com/package/@envheaven/plugins-nodejs-pnpm)
- [`@envheaven/plugins-firebase-hosting-deploy`](https://www.npmjs.com/package/@envheaven/plugins-firebase-hosting-deploy)

## License

MIT, as declared in `package.json`.
