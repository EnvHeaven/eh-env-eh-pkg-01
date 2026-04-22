# @envheaven/plugins-aws-s3-cdn-deploy

EnvHeaven plugin for **append-only** AWS S3 CDN deployment.

## Core principles

1. **Append-only** — new files are uploaded; existing remote files are never overwritten or deleted.
2. **Collision detection** — if a local file matches an existing remote key but has different content, deploy is **blocked** with loud diagnostics.
3. **No destructive sync** — remote objects are never deleted, even if they don't exist locally.

## Actions

### `deploy` (default)
Uploads only truly new local files to S3. Blocks if any collisions are detected. Skips files that already match remotely.

### `diff` / `inspect`
Categorizes every file into one of four buckets:
- **new-local** — exists locally but not remotely → safe to deploy
- **collision** — exists both locally and remotely with different content → blocks deploy
- **remote-only** — exists remotely but not locally → informational drift warning
- **match** — identical content locally and remotely → no action needed

### `clone` / `pull`
Downloads all remote objects into the local CDN directory. Use this to initialize a fresh local workspace from the remote bucket.

## Configuration

| Environment variable | Fallback | Required | Description |
|---------------------|----------|----------|-------------|
| `ENVHEAVEN_S3_CDN_BUCKET` | `AWS_S3_CDN_BUCKET` | Yes | S3 bucket name |
| `ENVHEAVEN_S3_CDN_REGION` | `AWS_REGION`, `AWS_DEFAULT_REGION` | Yes | AWS region |
| `ENVHEAVEN_S3_CDN_PREFIX` | — | No | Key prefix (e.g., `cdn/v1`) |
| `ENVHEAVEN_S3_CDN_LOCAL_DIR` | `WEB_SITE_01_CDN_01_LOCAL_FOLDER_PATH`, `CDN_LOCAL_DIR` | No | Local directory (default: `public/`) |
| `ENVHEAVEN_S3_CDN_INCLUDE_PATHS` | — | No | Comma/newline-separated or JSON array of relative paths/globs to include. Empty means include all. |
| `ENVHEAVEN_S3_CDN_EXCLUDE_PATHS` | — | No | Comma/newline-separated or JSON array of relative paths/globs to exclude after includes are matched. |
| `ENVHEAVEN_S3_CDN_ENDPOINT` | — | No | Custom endpoint (MinIO, LocalStack) |
| `ENVHEAVEN_S3_CDN_FORCE_PATH_STYLE` | — | No | Force path-style URLs (`true`/`false`) |

AWS credentials are resolved through the standard AWS SDK credential chain (env vars, shared config, IAM role, etc.).

## Non-goals

- **No file deletion** — this plugin will never issue `DeleteObject` calls.
- **No overwrite** — this plugin will never overwrite an existing S3 key with different content.
- **No versioning dependency** — works with or without S3 bucket versioning.
- **No full CDN management** — this is not CloudFront, not a CDN proxy; it manages the S3 origin content only.
- **No build pipeline** — this plugin serves/deploys static files as-is. Build steps belong in other plugins.

## EnvHeaven metadata integration

```yaml
# .envheaven/env-map.yaml (example)
deploy:
  cdn:
    plugin: "@envheaven/plugins-aws-s3-cdn-deploy"
    args: ["deploy"]
    env:
      ENVHEAVEN_S3_CDN_BUCKET: "my-cdn-bucket"
      ENVHEAVEN_S3_CDN_REGION: "us-east-1"
      ENVHEAVEN_S3_CDN_PREFIX: "assets/v1"
      ENVHEAVEN_S3_CDN_LOCAL_DIR: "artifacts/my-cdn"
      ENVHEAVEN_S3_CDN_INCLUDE_PATHS: "public/**"
      ENVHEAVEN_S3_CDN_EXCLUDE_PATHS: "public/tmp/**"
```

## Diagnostic codes

| Code | Severity | Meaning |
|------|----------|---------|
| `s3-cdn-bucket-missing` | error | No bucket configured |
| `s3-cdn-region-missing` | error | No region configured |
| `s3-cdn-collision-blocked` | error | Local file collides with remote object |
| `s3-cdn-deploy-aborted` | error | Deploy blocked due to collisions |
| `s3-cdn-upload-failed` | error | S3 PutObject failed |
| `s3-cdn-collisions-detected` | error | Inspect found collisions |
| `s3-cdn-remote-list-failed` | error | Failed to list remote objects |
| `s3-cdn-uploaded` | info | File successfully uploaded |
| `s3-cdn-local-scan` | info | Local scan complete |
| `s3-cdn-remote-scan` | info | Remote scan complete |
| `s3-cdn-new-files` | info | New files ready to deploy |
| `s3-cdn-clone-complete` | info | Clone operation complete |
| `s3-cdn-downloaded` | info | File downloaded during clone |
| `s3-cdn-remote-only-drift` | warning | Remote objects missing locally |
