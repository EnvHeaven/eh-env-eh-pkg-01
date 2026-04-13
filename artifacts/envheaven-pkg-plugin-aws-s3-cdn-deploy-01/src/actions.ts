import type { S3Client } from "@aws-sdk/client-s3";
import type { Diagnostic } from "envheaven";
import type {
  S3Config,
  LocalFileEntry,
  RemoteObjectEntry,
  DiffResult,
  DeployResult,
  CloneResult,
} from "./types";
import { uploadObject, downloadObject } from "./s3-client";
import path from "node:path";

export async function deployAdditionsOnly(
  client: S3Client,
  config: S3Config,
  diff: DiffResult,
): Promise<{ result: DeployResult; diagnostics: Diagnostic[] }> {
  const diagnostics: Diagnostic[] = [];
  const uploaded: string[] = [];
  const blocked: string[] = [];
  const skipped: string[] = [];

  if (diff.collisions.length > 0) {
    for (const entry of diff.collisions) {
      diagnostics.push({
        severity: "error",
        code: "s3-cdn-collision-blocked",
        message: `BLOCKED: "${entry.key}" exists remotely with different content. ${entry.reason ?? ""}`,
        path: entry.local?.absolutePath,
        details: {
          key: entry.key,
          localMd5: entry.local?.md5Hex,
          remoteEtag: entry.remote?.eTag,
          localSize: entry.local?.sizeBytes,
          remoteSize: entry.remote?.sizeBytes,
        },
      });
      blocked.push(entry.key);
    }
    diagnostics.push({
      severity: "error",
      code: "s3-cdn-deploy-aborted",
      message: `Deploy ABORTED: ${diff.collisions.length} collision(s) detected. Resolve conflicts before deploying. No files were uploaded.`,
    });
    return { result: { uploaded, blocked, skipped }, diagnostics };
  }

  for (const entry of diff.matches) {
    skipped.push(entry.key);
  }

  for (const entry of diff.newLocal) {
    if (!entry.local) continue;
    try {
      await uploadObject(
        client,
        config,
        entry.key,
        entry.local.absolutePath,
        entry.local.contentType,
      );
      uploaded.push(entry.key);
      diagnostics.push({
        severity: "info",
        code: "s3-cdn-uploaded",
        message: `Uploaded: "${entry.key}" (${entry.local.sizeBytes} bytes, ${entry.local.contentType})`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      diagnostics.push({
        severity: "error",
        code: "s3-cdn-upload-failed",
        message: `Failed to upload "${entry.key}": ${msg}`,
        path: entry.local.absolutePath,
      });
      blocked.push(entry.key);
    }
  }

  if (diff.remoteOnly.length > 0) {
    diagnostics.push({
      severity: "warning",
      code: "s3-cdn-remote-only-drift",
      message: `${diff.remoteOnly.length} remote-only object(s) not present locally. This is informational — remote objects are never deleted.`,
      details: {
        keys: diff.remoteOnly.map((e) => e.key),
      },
    });
  }

  return { result: { uploaded, blocked, skipped }, diagnostics };
}

export async function cloneRemoteToLocal(
  client: S3Client,
  config: S3Config,
  remoteObjects: RemoteObjectEntry[],
  localDir: string,
  prefix: string,
): Promise<{ result: CloneResult; diagnostics: Diagnostic[] }> {
  const diagnostics: Diagnostic[] = [];
  const downloaded: string[] = [];
  const skipped: string[] = [];

  for (const obj of remoteObjects) {
    const relativePath = prefix ? obj.key.slice(prefix.length + 1) : obj.key;
    if (!relativePath || relativePath.endsWith("/")) {
      skipped.push(obj.key);
      continue;
    }

    const destPath = path.join(localDir, relativePath);

    try {
      await downloadObject(client, config, obj.key, destPath);
      downloaded.push(obj.key);
      diagnostics.push({
        severity: "info",
        code: "s3-cdn-downloaded",
        message: `Downloaded: "${obj.key}" → ${relativePath}`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      diagnostics.push({
        severity: "error",
        code: "s3-cdn-download-failed",
        message: `Failed to download "${obj.key}": ${msg}`,
      });
    }
  }

  return { result: { downloaded, skipped }, diagnostics };
}
