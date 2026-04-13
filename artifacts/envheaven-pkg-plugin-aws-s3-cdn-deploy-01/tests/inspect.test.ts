import test from "node:test";
import assert from "node:assert/strict";
import { metadata, plugin } from "../src/index";

test("exports metadata with correct plugin identity", () => {
  assert.equal(metadata.packageName, "@envheaven/plugins-aws-s3-cdn-deploy");
  assert.equal(metadata.version, "0.1.0");
  assert.equal(metadata.pluginId, "aws-s3-cdn-deploy");
  assert.equal(metadata.kind, "deploy");
});

test("plugin exports both inspect and execute", () => {
  assert.equal(typeof plugin.inspect, "function");
  assert.equal(typeof plugin.execute, "function");
});

test("metadata description mentions append-only", () => {
  assert.match(metadata.description, /append-only/i);
});

test("metadata description mentions never deletes", () => {
  assert.match(metadata.description, /never deletes/i);
});
