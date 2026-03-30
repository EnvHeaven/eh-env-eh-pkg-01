# jd-env-eh-pkg-01

This repository is both:

- a monorepo that stores the EnvHeaven npm packages under `artifacts/`
- an EnvHeaven env-repo that can materialize package deployment plans

## Workspace layout

- `artifacts/envheaven-pkg-01`
- `artifacts/envheaven-pkg-plugin-nodejs-pnpm-01`
- `artifacts/envheaven-pkg-plugin-firebase-hosting-deploy-01`
- `.envheaven/`

## EnvHeaven metadata

The repo root now includes these env-map areas:

- `.envheaven/safe-env-map-layers/base-repo-env-map-layers/`
- `.envheaven/secret-env-map-layers/base-repo-env-map-layers/`
- `.envheaven/secret-env-map-layers/local-user-env-map-layers/`

Versioned repo metadata lives under `.envheaven/safe-env-map-layers/base-repo-env-map-layers/`.

Local-user and secret env-map layers live under `.envheaven/secret-env-map-layers/`. The repository keeps `.keep` markers there and ignores the actual secret layer files through `.envheaven/.gitignore`.

Expected layer file layout:

- `.envheaven/safe-env-map-layers/base-repo-env-map-layers/repo-base.default.envheaven.env-map-layer.json`
- `.envheaven/safe-env-map-layers/base-repo-env-map-layers/local-01.envheaven.env-map-layer.json`
- `.envheaven/secret-env-map-layers/local-user-env-map-layers/production-01.envheaven.env-map-layer.json`

`repo-base.default` defines the package artifacts, workspace deploy steps, and per-package distributors.

`local-01` defines local developer deployment:

- `pnpm install` at the workspace root
- recursive package build through the workspace
- `npm install --global <local-path>` for each publishable package

`production-01` defines production publication:

- `pnpm install` at the workspace root
- recursive package build through the workspace
- `npm whoami` auth check
- `npm publish` for each publishable package
- `--access public` for the scoped public EnvHeaven plugin packages

## Expected commands

Run these commands from the repository root:

```bash
envheaven deploy local
envheaven deploy local-01
envheaven deploy production
envheaven deploy production-01
envheaven
```

## Prerequisites

- `pnpm` available in the target Linux environment
- `npm` available in the target Linux environment
- valid npm package names
- npm auth configured before `production-01`

On Windows, EnvHeaven delegates structured execution through WSL in `0.1.0`. Install and configure WSL before invoking deploy commands from Windows hosts.

## Notes

- This repo keeps the `artifacts/` layout unchanged.
- Local deployment is only for developer testing.
- Production deployment publishes the package artifacts to npm and skips private packages if any are added later.
