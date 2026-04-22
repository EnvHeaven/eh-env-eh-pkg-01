import type { Diagnostic } from "envheaven";
import type { S3Config } from "./types";

export function resolveConfig(env: Record<string, string | undefined>): {
  config: S3Config | null;
  diagnostics: Diagnostic[];
} {
  const diagnostics: Diagnostic[] = [];
  const bucket = env["ENVHEAVEN_S3_CDN_BUCKET"] ?? env["AWS_S3_CDN_BUCKET"];
  const region = env["ENVHEAVEN_S3_CDN_REGION"] ?? env["AWS_REGION"] ?? env["AWS_DEFAULT_REGION"];
  const prefix = env["ENVHEAVEN_S3_CDN_PREFIX"] ?? "";
  const endpoint = env["ENVHEAVEN_S3_CDN_ENDPOINT"];
  const forcePathStyle = env["ENVHEAVEN_S3_CDN_FORCE_PATH_STYLE"] === "true";
  const includePaths = parsePathList(env["ENVHEAVEN_S3_CDN_INCLUDE_PATHS"]);
  const excludePaths = parsePathList(env["ENVHEAVEN_S3_CDN_EXCLUDE_PATHS"]);

  if (!bucket) {
    diagnostics.push({
      severity: "error",
      code: "s3-cdn-bucket-missing",
      message:
        "No S3 bucket configured. Set ENVHEAVEN_S3_CDN_BUCKET or AWS_S3_CDN_BUCKET.",
    });
    return { config: null, diagnostics };
  }

  if (!region) {
    diagnostics.push({
      severity: "error",
      code: "s3-cdn-region-missing",
      message:
        "No AWS region configured. Set ENVHEAVEN_S3_CDN_REGION or AWS_REGION.",
    });
    return { config: null, diagnostics };
  }

  const config: S3Config = { bucket, region, prefix, includePaths, excludePaths };
  if (endpoint) {
    config.endpoint = endpoint;
    config.forcePathStyle = forcePathStyle;
  }

  return { config, diagnostics };
}

function parsePathList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => String(item).trim())
          .filter(Boolean)
          .map(normalizePathPattern);
      }
    } catch {
      // Fall back to comma/newline parsing below for invalid JSON values.
    }
  }

  return trimmed
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .map(normalizePathPattern);
}

function normalizePathPattern(value: string): string {
  return value.replace(/\\/g, "/").replace(/^\.\/+/, "").replace(/^\/+/, "");
}
