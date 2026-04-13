import test from "node:test";
import assert from "node:assert/strict";
import { deployAdditionsOnly } from "../src/actions";
import { computeDiff } from "../src/diff";
import type { LocalFileEntry, RemoteObjectEntry, S3Config } from "../src/types";

function makeLocal(key: string, md5: string, size: number): LocalFileEntry {
  return {
    key,
    absolutePath: `/fake/${key}`,
    sizeBytes: size,
    contentType: "text/plain",
    md5Hex: md5,
  };
}

function makeRemote(key: string, etag: string, size: number): RemoteObjectEntry {
  return {
    key,
    sizeBytes: size,
    eTag: etag,
    lastModified: new Date(),
  };
}

const fakeConfig: S3Config = {
  bucket: "test-bucket",
  region: "us-east-1",
  prefix: "",
};

const fakeClient = {} as any;

test("deploy blocks when collisions exist — no files uploaded", async () => {
  const local = [
    makeLocal("assets/new.js", "aaa", 100),
    makeLocal("assets/existing.css", "bbb", 200),
  ];
  const remote = [
    makeRemote("assets/existing.css", "ccc", 200),
  ];

  const diff = computeDiff(local, remote);
  assert.equal(diff.collisions.length, 1, "precondition: one collision");

  const { result, diagnostics } = await deployAdditionsOnly(
    fakeClient,
    fakeConfig,
    diff,
  );

  assert.equal(result.uploaded.length, 0, "no files should be uploaded");
  assert.equal(result.blocked.length, 1);
  assert.equal(result.blocked[0], "assets/existing.css");

  const abortDiag = diagnostics.find((d) => d.code === "s3-cdn-deploy-aborted");
  assert.ok(abortDiag, "should have abort diagnostic");
  assert.equal(abortDiag?.severity, "error");
  assert.match(abortDiag?.message ?? "", /ABORTED/);

  const collisionDiag = diagnostics.find((d) => d.code === "s3-cdn-collision-blocked");
  assert.ok(collisionDiag, "should have collision diagnostic");
  assert.equal(collisionDiag?.severity, "error");
  assert.match(collisionDiag?.message ?? "", /BLOCKED/);
});

test("deploy skips matched files without re-uploading", async () => {
  const local = [makeLocal("data/stable.json", "xyz", 50)];
  const remote = [makeRemote("data/stable.json", "xyz", 50)];

  const diff = computeDiff(local, remote);
  assert.equal(diff.matches.length, 1, "precondition: one match");
  assert.equal(diff.newLocal.length, 0, "precondition: no new files");

  const { result, diagnostics } = await deployAdditionsOnly(
    fakeClient,
    fakeConfig,
    diff,
  );

  assert.equal(result.uploaded.length, 0);
  assert.equal(result.blocked.length, 0);
  assert.equal(result.skipped.length, 1);
  assert.equal(result.skipped[0], "data/stable.json");
});

test("deploy warns about remote-only drift but does not delete", async () => {
  const local: LocalFileEntry[] = [];
  const remote = [
    makeRemote("legacy/old-file.txt", "zzz", 10),
    makeRemote("legacy/another.txt", "yyy", 20),
  ];

  const diff = computeDiff(local, remote);
  assert.equal(diff.remoteOnly.length, 2, "precondition: two remote-only");

  const { result, diagnostics } = await deployAdditionsOnly(
    fakeClient,
    fakeConfig,
    diff,
  );

  assert.equal(result.uploaded.length, 0);
  assert.equal(result.blocked.length, 0);

  const driftDiag = diagnostics.find((d) => d.code === "s3-cdn-remote-only-drift");
  assert.ok(driftDiag, "should warn about remote-only drift");
  assert.equal(driftDiag?.severity, "warning");
  assert.match(driftDiag?.message ?? "", /never deleted/i);
});
