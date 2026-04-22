export interface AwsS3CdnDeployPluginMetadata {
  packageName: string;
  version: string;
  pluginId: string;
  kind: "deploy";
  description: string;
}

export interface S3Config {
  bucket: string;
  region: string;
  prefix: string;
  includePaths: string[];
  excludePaths: string[];
  endpoint?: string;
  forcePathStyle?: boolean;
}

export interface LocalFileEntry {
  key: string;
  absolutePath: string;
  sizeBytes: number;
  contentType: string;
  md5Hex: string;
}

export interface RemoteObjectEntry {
  key: string;
  sizeBytes: number;
  eTag: string;
  lastModified: Date | undefined;
}

export type DiffCategory =
  | "new-local"
  | "collision"
  | "remote-only"
  | "match";

export interface DiffEntry {
  key: string;
  category: DiffCategory;
  local?: LocalFileEntry;
  remote?: RemoteObjectEntry;
  reason?: string;
}

export interface DiffResult {
  newLocal: DiffEntry[];
  collisions: DiffEntry[];
  remoteOnly: DiffEntry[];
  matches: DiffEntry[];
}

export interface DeployResult {
  uploaded: string[];
  blocked: string[];
  skipped: string[];
}

export interface CloneResult {
  downloaded: string[];
  skipped: string[];
}

export interface InspectDetails extends Record<string, unknown> {
  config: S3Config | null;
  localDir: string;
  localFileCount: number;
  remoteObjectCount: number;
  diff: DiffResult;
}
