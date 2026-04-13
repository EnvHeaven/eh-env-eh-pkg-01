import {
  S3Client,
  ListObjectsV2Command,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import fs from "node:fs";
import path from "node:path";
import type { S3Config, RemoteObjectEntry } from "./types";

export function createS3Client(config: S3Config): S3Client {
  const clientConfig: ConstructorParameters<typeof S3Client>[0] = {
    region: config.region,
  };
  if (config.endpoint) {
    clientConfig.endpoint = config.endpoint;
    clientConfig.forcePathStyle = config.forcePathStyle ?? true;
  }
  return new S3Client(clientConfig);
}

export async function listRemoteObjects(
  client: S3Client,
  config: S3Config,
): Promise<RemoteObjectEntry[]> {
  const entries: RemoteObjectEntry[] = [];
  let continuationToken: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: config.bucket,
      Prefix: config.prefix || undefined,
      ContinuationToken: continuationToken,
    });
    const response = await client.send(command);

    if (response.Contents) {
      for (const obj of response.Contents) {
        if (!obj.Key) continue;
        entries.push({
          key: obj.Key,
          sizeBytes: obj.Size ?? 0,
          eTag: (obj.ETag ?? "").replace(/"/g, ""),
          lastModified: obj.LastModified,
        });
      }
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return entries;
}

export async function uploadObject(
  client: S3Client,
  config: S3Config,
  key: string,
  absolutePath: string,
  contentType: string,
): Promise<void> {
  const body = fs.readFileSync(absolutePath);
  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: "public, max-age=31536000, immutable",
  });
  await client.send(command);
}

export async function downloadObject(
  client: S3Client,
  config: S3Config,
  key: string,
  destPath: string,
): Promise<void> {
  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: key,
  });
  const response = await client.send(command);
  if (!response.Body) {
    throw new Error(`Empty body for key: ${key}`);
  }

  const dir = path.dirname(destPath);
  fs.mkdirSync(dir, { recursive: true });

  const chunks: Buffer[] = [];
  const stream = response.Body as AsyncIterable<Uint8Array>;
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  fs.writeFileSync(destPath, Buffer.concat(chunks));
}

export async function headObject(
  client: S3Client,
  config: S3Config,
  key: string,
): Promise<{ contentType: string; cacheControl: string } | null> {
  try {
    const command = new HeadObjectCommand({
      Bucket: config.bucket,
      Key: key,
    });
    const response = await client.send(command);
    return {
      contentType: response.ContentType ?? "application/octet-stream",
      cacheControl: response.CacheControl ?? "",
    };
  } catch {
    return null;
  }
}
