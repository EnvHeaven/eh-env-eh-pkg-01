import test from "node:test";
import assert from "node:assert/strict";
import { computeDiff } from "../src/diff";
import type { LocalFileEntry, RemoteObjectEntry } from "../src/types";

function makeLocal(key: string, md5: string, size: number): LocalFileEntry {
  return {
    key,
    absolutePath: `/fake/${key}`,
    sizeBytes: size,
    contentType: "application/octet-stream",
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

test("new local files are categorized as new-local", () => {
  const local = [makeLocal("assets/icon.png", "abc123", 1024)];
  const remote: RemoteObjectEntry[] = [];

  const diff = computeDiff(local, remote);

  assert.equal(diff.newLocal.length, 1);
  assert.equal(diff.newLocal[0].key, "assets/icon.png");
  assert.equal(diff.newLocal[0].category, "new-local");
  assert.equal(diff.collisions.length, 0);
  assert.equal(diff.remoteOnly.length, 0);
  assert.equal(diff.matches.length, 0);
});

test("matching files (same md5 + size) are categorized as match", () => {
  const local = [makeLocal("config/app.json", "deadbeef", 512)];
  const remote = [makeRemote("config/app.json", "deadbeef", 512)];

  const diff = computeDiff(local, remote);

  assert.equal(diff.matches.length, 1);
  assert.equal(diff.matches[0].key, "config/app.json");
  assert.equal(diff.matches[0].category, "match");
  assert.equal(diff.newLocal.length, 0);
  assert.equal(diff.collisions.length, 0);
});

test("collision detected when same key has different md5", () => {
  const local = [makeLocal("data/v1.json", "aaa111", 100)];
  const remote = [makeRemote("data/v1.json", "bbb222", 100)];

  const diff = computeDiff(local, remote);

  assert.equal(diff.collisions.length, 1);
  assert.equal(diff.collisions[0].key, "data/v1.json");
  assert.equal(diff.collisions[0].category, "collision");
  assert.ok(diff.collisions[0].reason);
  assert.match(diff.collisions[0].reason!, /md5 mismatch/);
  assert.equal(diff.newLocal.length, 0);
  assert.equal(diff.matches.length, 0);
});

test("collision detected when same key has different size", () => {
  const local = [makeLocal("data/v1.json", "aaa111", 100)];
  const remote = [makeRemote("data/v1.json", "aaa111", 200)];

  const diff = computeDiff(local, remote);

  assert.equal(diff.collisions.length, 1);
  assert.match(diff.collisions[0].reason!, /size mismatch/);
});

test("remote-only files are categorized correctly", () => {
  const local: LocalFileEntry[] = [];
  const remote = [makeRemote("old/legacy.css", "fff000", 2048)];

  const diff = computeDiff(local, remote);

  assert.equal(diff.remoteOnly.length, 1);
  assert.equal(diff.remoteOnly[0].key, "old/legacy.css");
  assert.equal(diff.remoteOnly[0].category, "remote-only");
  assert.equal(diff.newLocal.length, 0);
});

test("mixed scenario: new + collision + remote-only + match", () => {
  const local = [
    makeLocal("new-file.js", "111", 50),
    makeLocal("shared.css", "222", 100),
    makeLocal("exact.html", "333", 75),
  ];
  const remote = [
    makeRemote("shared.css", "999", 100),
    makeRemote("exact.html", "333", 75),
    makeRemote("orphan.txt", "444", 30),
  ];

  const diff = computeDiff(local, remote);

  assert.equal(diff.newLocal.length, 1);
  assert.equal(diff.newLocal[0].key, "new-file.js");
  assert.equal(diff.collisions.length, 1);
  assert.equal(diff.collisions[0].key, "shared.css");
  assert.equal(diff.matches.length, 1);
  assert.equal(diff.matches[0].key, "exact.html");
  assert.equal(diff.remoteOnly.length, 1);
  assert.equal(diff.remoteOnly[0].key, "orphan.txt");
});

test("empty local and empty remote yields empty diff", () => {
  const diff = computeDiff([], []);
  assert.equal(diff.newLocal.length, 0);
  assert.equal(diff.collisions.length, 0);
  assert.equal(diff.remoteOnly.length, 0);
  assert.equal(diff.matches.length, 0);
});
