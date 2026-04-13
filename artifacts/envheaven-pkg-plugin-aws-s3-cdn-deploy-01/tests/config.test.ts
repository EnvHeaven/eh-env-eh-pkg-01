import test from "node:test";
import assert from "node:assert/strict";
import { resolveConfig } from "../src/config";

test("resolveConfig returns error when bucket is missing", () => {
  const { config, diagnostics } = resolveConfig({});

  assert.equal(config, null);
  assert.ok(diagnostics.length > 0);
  assert.equal(diagnostics[0].code, "s3-cdn-bucket-missing");
  assert.equal(diagnostics[0].severity, "error");
});

test("resolveConfig returns error when region is missing", () => {
  const { config, diagnostics } = resolveConfig({
    ENVHEAVEN_S3_CDN_BUCKET: "my-bucket",
  });

  assert.equal(config, null);
  const regionDiag = diagnostics.find((d) => d.code === "s3-cdn-region-missing");
  assert.ok(regionDiag);
  assert.equal(regionDiag?.severity, "error");
});

test("resolveConfig returns valid config with bucket + region", () => {
  const { config, diagnostics } = resolveConfig({
    ENVHEAVEN_S3_CDN_BUCKET: "my-cdn-bucket",
    ENVHEAVEN_S3_CDN_REGION: "eu-west-1",
  });

  assert.ok(config);
  assert.equal(config!.bucket, "my-cdn-bucket");
  assert.equal(config!.region, "eu-west-1");
  assert.equal(config!.prefix, "");
  assert.equal(diagnostics.length, 0);
});

test("resolveConfig picks up prefix and endpoint", () => {
  const { config } = resolveConfig({
    ENVHEAVEN_S3_CDN_BUCKET: "b",
    ENVHEAVEN_S3_CDN_REGION: "us-east-1",
    ENVHEAVEN_S3_CDN_PREFIX: "cdn/v1",
    ENVHEAVEN_S3_CDN_ENDPOINT: "http://localhost:9000",
    ENVHEAVEN_S3_CDN_FORCE_PATH_STYLE: "true",
  });

  assert.ok(config);
  assert.equal(config!.prefix, "cdn/v1");
  assert.equal(config!.endpoint, "http://localhost:9000");
  assert.equal(config!.forcePathStyle, true);
});

test("resolveConfig falls back to AWS_REGION and AWS_S3_CDN_BUCKET", () => {
  const { config } = resolveConfig({
    AWS_S3_CDN_BUCKET: "fallback-bucket",
    AWS_REGION: "ap-southeast-1",
  });

  assert.ok(config);
  assert.equal(config!.bucket, "fallback-bucket");
  assert.equal(config!.region, "ap-southeast-1");
});
