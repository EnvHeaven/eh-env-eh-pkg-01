import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { LocalFileEntry } from "./types";

const CONTENT_TYPE_MAP: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".mjs": "application/javascript",
  ".json": "application/json",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".otf": "font/otf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".csv": "text/csv",
  ".yaml": "text/yaml",
  ".yml": "text/yaml",
  ".map": "application/json",
  ".wasm": "application/wasm",
};

export function guessContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return CONTENT_TYPE_MAP[ext] ?? "application/octet-stream";
}

export function computeMd5Hex(absolutePath: string): string {
  const content = fs.readFileSync(absolutePath);
  return crypto.createHash("md5").update(content).digest("hex");
}

export function scanLocalDir(baseDir: string, prefix: string): LocalFileEntry[] {
  if (!fs.existsSync(baseDir)) {
    return [];
  }

  const entries: LocalFileEntry[] = [];

  function walk(dir: string): void {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      if (item.name.startsWith(".")) continue;
      const full = path.join(dir, item.name);
      if (item.isDirectory()) {
        walk(full);
      } else if (item.isFile()) {
        const relativeToCdn = path.relative(baseDir, full).replace(/\\/g, "/");
        const key = prefix ? `${prefix}/${relativeToCdn}` : relativeToCdn;
        const stat = fs.statSync(full);
        entries.push({
          key,
          absolutePath: full,
          sizeBytes: stat.size,
          contentType: guessContentType(full),
          md5Hex: computeMd5Hex(full),
        });
      }
    }
  }

  walk(baseDir);
  return entries;
}
