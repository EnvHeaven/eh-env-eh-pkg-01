# jd-env-eh-pkg-01

This repository is both:

- a monorepo that stores the EnvHeaven npm packages under `artifacts/`
- an EnvHeaven env-repo that can materialize package deployment plans

## Workspace layout

- `artifacts/envheaven-pkg-01`
- `artifacts/envheaven-pkg-plugin-nodejs-pnpm-01`
- `artifacts/envheaven-pkg-plugin-firebase-hosting-deploy-01`
- `artifacts/envheaven-pkg-plugin-offiline-web-ui-01`
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
- `pnpm -r --if-present run build`
- `npm install --global <local-path>` for each publishable package

`production-01` defines production publication:

- `pnpm install` at the workspace root
- `pnpm -r --if-present run build`
- `npm whoami` auth check
- `npm publish` for each publishable package
- `--access public` for the scoped public EnvHeaven plugin packages
- production package versions come from the local EnvHeaven version registry, not directly from the checked-in `package.json` version field
- after a successful publish, the registry advances `lastVersion` and `nextVersion`

## Expected commands

Run these commands from the repository root:

```bash
envheaven deploy local
envheaven deploy local-01
envheaven deploy production
envheaven deploy production-01
envheaven deploy production @envheaven/plugins-offiline-web-ui
envheaven deploy local envheaven
envheaven
envheaven offiline-web-ui
```

## Prerequisites

- `pnpm` available in the target Linux environment
- `npm` available in the target Linux environment
- valid npm package names
- npm auth configured before `production-01`

On Windows, local package-repo deploy steps that use `pnpm` or `npm` run natively in the Windows host environment in `0.1.0`. Other non-package-manager execution paths still use the existing WSL delegation behavior.

## Offline UI and local state

Running `envheaven` starts the daemon and prints a tip for `envheaven offiline-web-ui`.

Running `envheaven offiline-web-ui` starts the daemon, launches the local UI server, and prints the UI URL. In this repo it prefers the local workspace plugin build; outside this repo it can install the UI package into a per-user cache.

Local state is stored per user:

- Windows: `%LOCALAPPDATA%\\EnvHeaven\\state\\state.json`
- Linux: `$XDG_STATE_HOME/envheaven/state.json` or `~/.local/state/envheaven/state.json`

The UI and daemon persist:

- recently used env-repo roots
- selected repo
- artifact `lastVersion` and `nextVersion`

## Artifact selectors

Deploy commands still default to all artifacts, but you can now select a subset with order-insensitive tags:

```bash
envheaven deploy production @envheaven/plugins-offiline-web-ui
envheaven deploy production envheaven-package-01
envheaven deploy local plugins-nodejs-pnpm
envheaven deploy local envheaven
```

Selectors resolve against artifact names, package names, and common aliases such as unscoped package names. Ambiguous selectors are rejected.

## Production version override and tagging

For `production-01`, EnvHeaven resolves the target artifact version from the local version registry. It temporarily rewrites the artifact `package.json` version before `npm publish`, restores the file afterward, and then advances the registry on success.

If no registry entry exists yet, EnvHeaven falls back to the artifact's current `package.json` version and reports that fallback in diagnostics.

Successful production deploys create a local git tag inside the artifact repo when it is a nested git repo or submodule:

- `build-v<version>_<deployTarget>`
- example: `build-v1.0.393_production-01`

Tags stay local by default. Set `EH_GIT_PUSH_TAGS=1` to push them.

## Notes

- This repo keeps the `artifacts/` layout unchanged.
- Local deployment is only for developer testing.
- Production deployment publishes the package artifacts to npm and skips private packages if any are added later.
- `.envheaven/secret-env-map-layers/` stays unversioned except for the `.keep` markers allowed by `.envheaven/.gitignore`.
