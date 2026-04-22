import type {
  Diagnostic,
  EnvHeavenPlugin,
  PluginInspectResult,
  PluginExecuteResult,
  PluginRuntimeContext,
  ResolvedPlan,
} from "envheaven";
import type {
  AwsS3CdnDeployPluginMetadata,
  InspectDetails,
  S3Config,
} from "./types";
import { resolveConfig } from "./config";
import { scanLocalDir } from "./local-scanner";
import { createS3Client, listRemoteObjects } from "./s3-client";
import { computeDiff } from "./diff";
import { deployAdditionsOnly, cloneRemoteToLocal } from "./actions";
import path from "node:path";

export type {
  AwsS3CdnDeployPluginMetadata,
  InspectDetails,
  S3Config,
  LocalFileEntry,
  RemoteObjectEntry,
  DiffEntry,
  DiffResult,
  DiffCategory,
  DeployResult,
  CloneResult,
} from "./types";

export { computeDiff } from "./diff";
export { scanLocalDir, guessContentType, computeMd5Hex } from "./local-scanner";
export { resolveConfig } from "./config";
export { deployAdditionsOnly, cloneRemoteToLocal } from "./actions";

export const metadata: AwsS3CdnDeployPluginMetadata = {
  packageName: "@envheaven/plugins-aws-s3-cdn-deploy",
  version: "0.1.0",
  pluginId: "aws-s3-cdn-deploy",
  kind: "deploy",
  description:
    "Append-only AWS S3 CDN deploy plugin. Uploads new files, blocks overwrites, never deletes remote objects.",
};

function resolveLocalDir(context: PluginRuntimeContext): string {
  const envDir =
    process.env["ENVHEAVEN_S3_CDN_LOCAL_DIR"] ??
    process.env["WEB_SITE_01_CDN_01_LOCAL_FOLDER_PATH"] ??
    process.env["CDN_LOCAL_DIR"];
  if (envDir) {
    return path.resolve(context.repoRoot, envDir);
  }
  return path.resolve(context.repoRoot, "public");
}

export async function inspect(
  context: PluginRuntimeContext,
): Promise<PluginInspectResult> {
  const diagnostics: Diagnostic[] = [];
  const localDir = resolveLocalDir(context);

  const { config, diagnostics: configDiags } = resolveConfig(
    process.env as Record<string, string | undefined>,
  );
  diagnostics.push(...configDiags);

  const localFiles = scanLocalDir(localDir, config?.prefix ?? "", {
    includePaths: config?.includePaths,
    excludePaths: config?.excludePaths,
  });
  diagnostics.push({
    severity: "info",
    code: "s3-cdn-local-scan",
    message: `Found ${localFiles.length} local file(s) in ${localDir}`,
  });

  if (!config) {
    const details: InspectDetails = {
      config: null,
      localDir,
      localFileCount: localFiles.length,
      remoteObjectCount: 0,
      diff: { newLocal: [], collisions: [], remoteOnly: [], matches: [] },
    };
    return { diagnostics, details };
  }

  let remoteObjects: import("./types").RemoteObjectEntry[];
  try {
    const client = createS3Client(config);
    remoteObjects = await listRemoteObjects(client, config);
    diagnostics.push({
      severity: "info",
      code: "s3-cdn-remote-scan",
      message: `Found ${remoteObjects.length} remote object(s) in s3://${config.bucket}/${config.prefix}`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    diagnostics.push({
      severity: "error",
      code: "s3-cdn-remote-list-failed",
      message: `Failed to list remote objects: ${msg}`,
    });
    remoteObjects = [];
  }

  const diff = computeDiff(localFiles, remoteObjects);

  if (diff.collisions.length > 0) {
    diagnostics.push({
      severity: "error",
      code: "s3-cdn-collisions-detected",
      message: `DANGER: ${diff.collisions.length} local file(s) collide with existing remote objects. Deploy will be BLOCKED.`,
      details: {
        keys: diff.collisions.map((e) => e.key),
      },
    });
  }

  if (diff.newLocal.length > 0) {
    diagnostics.push({
      severity: "info",
      code: "s3-cdn-new-files",
      message: `${diff.newLocal.length} new file(s) ready to deploy.`,
      details: { keys: diff.newLocal.map((e) => e.key) },
    });
  }

  if (diff.remoteOnly.length > 0) {
    diagnostics.push({
      severity: "warning",
      code: "s3-cdn-remote-only-drift",
      message: `${diff.remoteOnly.length} remote-only object(s) not present locally. Run clone to sync them.`,
      details: { keys: diff.remoteOnly.map((e) => e.key) },
    });
  }

  const details: InspectDetails = {
    config,
    localDir,
    localFileCount: localFiles.length,
    remoteObjectCount: remoteObjects.length,
    diff,
  };

  return { diagnostics, details };
}

export async function execute(
  plan: ResolvedPlan,
  context: PluginRuntimeContext,
): Promise<PluginExecuteResult> {
  const diagnostics: Diagnostic[] = [];
  const localDir = resolveLocalDir(context);
  const action = plan.execution?.args?.[0] ?? "deploy";

  const { config, diagnostics: configDiags } = resolveConfig(
    process.env as Record<string, string | undefined>,
  );
  diagnostics.push(...configDiags);

  if (!config) {
    return { diagnostics, exitCode: 1 };
  }

  const client = createS3Client(config);

  if (action === "clone" || action === "pull") {
    const remoteObjects = await listRemoteObjects(client, config);
    const { result, diagnostics: cloneDiags } = await cloneRemoteToLocal(
      client,
      config,
      remoteObjects,
      localDir,
      config.prefix,
    );
    diagnostics.push(...cloneDiags);
    diagnostics.push({
      severity: "info",
      code: "s3-cdn-clone-complete",
      message: `Clone complete: ${result.downloaded.length} downloaded, ${result.skipped.length} skipped.`,
    });
    return {
      diagnostics,
      exitCode: 0,
      details: { action: "clone", ...result } as Record<string, unknown>,
    };
  }

  if (action === "diff" || action === "inspect") {
    const inspectResult = await inspect(context);
    diagnostics.push(...(inspectResult.diagnostics ?? []));
    return {
      diagnostics,
      exitCode:
        (inspectResult.details as InspectDetails | undefined)?.diff.collisions.length
          ? 1
          : 0,
      details: inspectResult.details,
    };
  }

  const localFiles = scanLocalDir(localDir, config.prefix, {
    includePaths: config.includePaths,
    excludePaths: config.excludePaths,
  });
  const remoteObjects = await listRemoteObjects(client, config);
  const diff = computeDiff(localFiles, remoteObjects);

  const { result, diagnostics: deployDiags } = await deployAdditionsOnly(
    client,
    config,
    diff,
  );
  diagnostics.push(...deployDiags);

  const exitCode = result.blocked.length > 0 ? 1 : 0;

  return {
    diagnostics,
    exitCode,
    details: { action: "deploy", ...result } as Record<string, unknown>,
  };
}

export const plugin: EnvHeavenPlugin = {
  inspect,
  execute,
};
