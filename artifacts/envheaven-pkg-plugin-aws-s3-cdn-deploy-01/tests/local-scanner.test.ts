import test from "node:test";
import assert from "node:assert/strict";
import { guessContentType, shouldIncludePath } from "../src/local-scanner";

test("guessContentType returns correct MIME for common extensions", () => {
  assert.equal(guessContentType("file.html"), "text/html");
  assert.equal(guessContentType("file.css"), "text/css");
  assert.equal(guessContentType("file.js"), "application/javascript");
  assert.equal(guessContentType("file.json"), "application/json");
  assert.equal(guessContentType("file.png"), "image/png");
  assert.equal(guessContentType("file.jpg"), "image/jpeg");
  assert.equal(guessContentType("file.svg"), "image/svg+xml");
  assert.equal(guessContentType("file.woff2"), "font/woff2");
  assert.equal(guessContentType("file.wasm"), "application/wasm");
});

test("guessContentType returns octet-stream for unknown extensions", () => {
  assert.equal(guessContentType("file.xyz"), "application/octet-stream");
  assert.equal(guessContentType("file.custom"), "application/octet-stream");
});

test("guessContentType is case-insensitive for extension", () => {
  assert.equal(guessContentType("file.HTML"), "text/html");
  assert.equal(guessContentType("file.JSON"), "application/json");
  assert.equal(guessContentType("file.PNG"), "image/png");
});

test("path filters allowlist included CDN folders", () => {
  const filters = { includePaths: ["public/**"], excludePaths: [] };

  assert.equal(shouldIncludePath("public/logo.png", filters), true);
  assert.equal(shouldIncludePath("public/nested/logo.png", filters), true);
  assert.equal(shouldIncludePath("logs/raw-events/file.jsonl", filters), false);
  assert.equal(shouldIncludePath("README.txt", filters), false);
});

test("path filters exclude matched files after include matching", () => {
  const filters = { includePaths: ["public/**"], excludePaths: ["public/tmp/**"] };

  assert.equal(shouldIncludePath("public/logo.png", filters), true);
  assert.equal(shouldIncludePath("public/tmp/debug.json", filters), false);
});
