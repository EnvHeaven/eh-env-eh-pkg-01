# EnvHeaven NPM publish plan

> **Do not run unless reviewed.** This file is a publish plan only. PRM #2.3 did not run `npm publish`, `npm deprecate`, or `git push`.

## Package targets

| Package | Local package.json version | Registry status verified in PRM #2.3 | Intended tags |
|---|---:|---|---|
| `envheaven` | `0.1.1` | published: `latest=0.1.80`, `exp=0.1.84-exp.0` | `release`, `latest`, `exp` |
| `@envheaven/plugins-nodejs-pnpm` | `0.1.84-exp.0` | published: `latest=0.1.81`, `exp=0.1.84-exp.0` | `release`, `latest`, `exp` |
| `@envheaven/plugins-firebase-hosting-deploy` | `0.1.84-exp.0` | published: `latest=0.1.81`, `exp=0.1.84-exp.0` | `release`, `latest`, `exp` |
| `@envheaven/plugins-offline-web-ui` | `0.1.0` | not found on NPM | `release`, `latest`, `exp` |
| `@envheaven/plugins-aws-s3-cdn-deploy` | `0.1.0` | not found on NPM | `release`, `latest`, `exp` |

The legacy typo package `@envheaven/plugins-offiline-web-ui` was verified as published with `latest=0.1.81` and `exp=0.1.84-exp.0`. It is not a target package name after the rename.

## Version note

The EnvHeaven publish flow may rewrite package versions dynamically before publish and restore package files afterward. Do not publish the static local versions above without confirming the intended release version and checking that the same package version has not already been published.

NPM does not allow publishing the same package version twice. To point multiple tags at the same version, publish once and then use `npm dist-tag add`.

## Dry-run results

`npm pack --dry-run --json --ignore-scripts` was run for each publish-target package.

| Package | README included | SVG included |
|---|---|---|
| `envheaven` | yes | yes |
| `@envheaven/plugins-nodejs-pnpm` | yes | yes |
| `@envheaven/plugins-firebase-hosting-deploy` | yes | yes |
| `@envheaven/plugins-offline-web-ui` | yes | yes |
| `@envheaven/plugins-aws-s3-cdn-deploy` | yes | yes |

## Registry verification commands

```sh
npm view envheaven name version dist-tags versions --json
npm view @envheaven/plugins-nodejs-pnpm name version dist-tags versions --json
npm view @envheaven/plugins-firebase-hosting-deploy name version dist-tags versions --json
npm view @envheaven/plugins-offline-web-ui name version dist-tags versions --json
npm view @envheaven/plugins-offiline-web-ui name version dist-tags versions --json
npm view @envheaven/plugins-aws-s3-cdn-deploy name version dist-tags versions --json
```

## Release publish commands

Replace `<release-version>` with the reviewed version that is not already published.

```sh
# envheaven
cd artifacts/envheaven-pkg-01
npm publish --tag release
npm dist-tag add envheaven@<release-version> latest

# Node.js pnpm plugin
cd ../envheaven-pkg-plugin-nodejs-pnpm-01
npm publish --access public --tag release
npm dist-tag add @envheaven/plugins-nodejs-pnpm@<release-version> latest

# Firebase Hosting deploy plugin
cd ../envheaven-pkg-plugin-firebase-hosting-deploy-01
npm publish --access public --tag release
npm dist-tag add @envheaven/plugins-firebase-hosting-deploy@<release-version> latest

# corrected Offline Web UI package
cd ../envheaven-pkg-plugin-offiline-web-ui-01
npm publish --access public --tag release
npm dist-tag add @envheaven/plugins-offline-web-ui@<release-version> latest

# AWS S3 CDN deploy plugin
cd ../envheaven-pkg-plugin-aws-s3-cdn-deploy-01
npm publish --access public --tag release
npm dist-tag add @envheaven/plugins-aws-s3-cdn-deploy@<release-version> latest
```

## Exp publish commands

Replace `<exp-version>` with the reviewed prerelease version that is not already published.

```sh
# envheaven
cd artifacts/envheaven-pkg-01
npm publish --tag exp

# Node.js pnpm plugin
cd ../envheaven-pkg-plugin-nodejs-pnpm-01
npm publish --access public --tag exp

# Firebase Hosting deploy plugin
cd ../envheaven-pkg-plugin-firebase-hosting-deploy-01
npm publish --access public --tag exp

# corrected Offline Web UI package
cd ../envheaven-pkg-plugin-offiline-web-ui-01
npm publish --access public --tag exp

# AWS S3 CDN deploy plugin
cd ../envheaven-pkg-plugin-aws-s3-cdn-deploy-01
npm publish --access public --tag exp
```

## Offline Web UI rename and deprecation

After `@envheaven/plugins-offline-web-ui` is published and verified:

```sh
npm deprecate @envheaven/plugins-offiline-web-ui "Package renamed to @envheaven/plugins-offline-web-ui. Please install the corrected package name."
```

Do not deprecate the old typo package before the corrected package is available on NPM.

## OTP and 2FA

If the NPM account or organization requires 2FA, publish and dist-tag commands may require an OTP:

```sh
npm publish --access public --tag release --otp <code>
npm dist-tag add <package>@<version> latest --otp <code>
```

## Pre-publish checklist

- Confirm package versions and dist-tags with `npm view`.
- Confirm `npm pack --dry-run --json` still includes `README.md` and `docs/readme/logo/envheaven-logo.svg`.
- Confirm the corrected Offline Web UI package name is intentional for the publish run.
- Confirm AWS S3 CDN plugin publication is intended for the organization.
- Confirm no source or build artifacts are accidentally dirty.
- Confirm NPM auth with `npm whoami`.
