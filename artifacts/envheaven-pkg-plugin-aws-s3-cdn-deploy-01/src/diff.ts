import type {
  LocalFileEntry,
  RemoteObjectEntry,
  DiffEntry,
  DiffResult,
} from "./types";

export function computeDiff(
  localFiles: LocalFileEntry[],
  remoteObjects: RemoteObjectEntry[],
): DiffResult {
  const remoteByKey = new Map<string, RemoteObjectEntry>();
  for (const obj of remoteObjects) {
    remoteByKey.set(obj.key, obj);
  }

  const localByKey = new Map<string, LocalFileEntry>();
  for (const file of localFiles) {
    localByKey.set(file.key, file);
  }

  const newLocal: DiffEntry[] = [];
  const collisions: DiffEntry[] = [];
  const matches: DiffEntry[] = [];

  for (const file of localFiles) {
    const remote = remoteByKey.get(file.key);

    if (!remote) {
      newLocal.push({
        key: file.key,
        category: "new-local",
        local: file,
      });
      continue;
    }

    const etagMatchesMd5 = remote.eTag === file.md5Hex;
    const sizeMatches = remote.sizeBytes === file.sizeBytes;

    if (etagMatchesMd5 && sizeMatches) {
      matches.push({
        key: file.key,
        category: "match",
        local: file,
        remote,
      });
    } else {
      const reasons: string[] = [];
      if (!etagMatchesMd5) {
        reasons.push(`md5 mismatch (local=${file.md5Hex}, remote-etag=${remote.eTag})`);
      }
      if (!sizeMatches) {
        reasons.push(`size mismatch (local=${file.sizeBytes}, remote=${remote.sizeBytes})`);
      }
      collisions.push({
        key: file.key,
        category: "collision",
        local: file,
        remote,
        reason: reasons.join("; "),
      });
    }
  }

  const remoteOnly: DiffEntry[] = [];
  for (const obj of remoteObjects) {
    if (!localByKey.has(obj.key)) {
      remoteOnly.push({
        key: obj.key,
        category: "remote-only",
        remote: obj,
      });
    }
  }

  return { newLocal, collisions, remoteOnly, matches };
}
