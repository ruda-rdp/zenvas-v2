/**
 * Object Storage Abstraction Layer
 *
 * Per CONSTITUTION.md Rule #10 (v1.3): Zenvas MAY manage its own object storage.
 * This module provides a unified interface for S3/R2-compatible storage.
 *
 * Features:
 * - Presigned URL generation for direct client uploads
 * - Public URL generation for served assets
 * - File validation (type, size)
 *
 * Environment variables required:
 * - S3_ENDPOINT: Storage endpoint (e.g., https://abc123.r2.cloudflarestorage.com)
 * - S3_REGION: Region (e.g., auto)
 * - S3_BUCKET: Bucket name
 * - S3_ACCESS_KEY_ID: Access key
 * - S3_SECRET_ACCESS_KEY: Secret key
 * - S3_PUBLIC_BASE_URL: Public URL prefix (e.g., https://cdn.example.com)
 * - UPLOAD_MAX_MB: Max upload size in MB (default: 15)
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Storage configuration from environment
interface StorageConfig {
  endpoint: string | undefined;
  region: string;
  bucket: string | undefined;
  accessKeyId: string | undefined;
  secretAccessKey: string | undefined;
  publicBaseUrl: string | undefined;
  maxSizeMb: number;
}

function getConfig(): StorageConfig {
  return {
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || "auto",
    bucket: process.env.S3_BUCKET,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    publicBaseUrl: process.env.S3_PUBLIC_BASE_URL,
    maxSizeMb: parseInt(process.env.UPLOAD_MAX_MB || "15", 10),
  };
}

/**
 * Check if storage is configured
 */
export function isStorageConfigured(): boolean {
  const config = getConfig();
  return !!(
    config.endpoint &&
    config.bucket &&
    config.accessKeyId &&
    config.secretAccessKey
  );
}

/**
 * Create S3 client from environment config
 */
function createS3Client(): S3Client {
  const config = getConfig();

  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId!,
      secretAccessKey: config.secretAccessKey!,
    },
    // Force path-style for R2 and compatible services
    forcePathStyle: true,
  });
}

/**
 * Allowed MIME types for uploads
 */
export const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export type AllowedMimeType = (typeof ALLOWED_TYPES)[number];

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  mimeType?: string;
  size?: number;
}

/**
 * Validate file type
 */
export function validateFileType(mimeType: string): boolean {
  return ALLOWED_TYPES.includes(mimeType as AllowedMimeType);
}

/**
 * Validate file size
 */
export function validateFileSize(sizeBytes: number, maxMb?: number): boolean {
  const config = getConfig();
  const maxBytes = (maxMb || config.maxSizeMb) * 1024 * 1024;
  return sizeBytes <= maxBytes;
}

/**
 * Validate upload request
 */
export function validateUpload(
  mimeType: string,
  sizeBytes: number
): ValidationResult {
  if (!validateFileType(mimeType)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}`,
    };
  }

  const config = getConfig();
  if (!validateFileSize(sizeBytes, config.maxSizeMb)) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${config.maxSizeMb}MB`,
    };
  }

  return {
    valid: true,
    mimeType,
    size: sizeBytes,
  };
}

/**
 * Generate a unique object key for uploads
 */
export function generateObjectKey(
  filename: string,
  prefix = "uploads"
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = filename.split(".").pop() || "bin";
  const sanitized = filename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .substring(0, 50);

  return `${prefix}/${timestamp}-${random}-${sanitized}.${ext}`;
}

/**
 * Get public URL for an object
 */
export function getPublicUrl(objectKey: string): string {
  const config = getConfig();

  if (config.publicBaseUrl) {
    // Use custom public base URL (CDN, custom domain, etc.)
    return `${config.publicBaseUrl.replace(/\/$/, "")}/${objectKey}`;
  }

  // Fallback: construct URL from endpoint
  if (config.endpoint) {
    return `${config.endpoint}/${config.bucket}/${objectKey}`;
  }

  // No storage configured - should not happen if checked before
  return objectKey;
}

/**
 * Generate a presigned PUT URL for direct client upload
 *
 * This implements the presigned URL pattern:
 * 1. Client requests presigned URL from server
 * 2. Server returns presigned PUT URL + final public URL
 * 3. Client uploads directly to storage
 * 4. Client uses final public URL to save reference in DB
 *
 * @param objectKey - The storage key for the object
 * @param mimeType - Expected MIME type
 * @param expiresIn - URL expiration in seconds (default: 3600 = 1 hour)
 * @returns Presigned URL for upload + final public URL
 */
export async function generatePresignedUploadUrl(
  objectKey: string,
  mimeType: string,
  expiresIn = 3600
): Promise<{ presignedUrl: string; publicUrl: string }> {
  if (!isStorageConfigured()) {
    throw new Error("Storage is not configured");
  }

  const config = getConfig();
  const client = createS3Client();

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: objectKey,
    ContentType: mimeType,
    // Cache control for images
    CacheControl: "public, max-age=31536000, immutable",
  });

  const presignedUrl = await getSignedUrl(client, command, { expiresIn });

  return {
    presignedUrl,
    publicUrl: getPublicUrl(objectKey),
  };
}

/**
 * Upload file directly (server-side)
 *
 * Use this for small files or when you need to process the file server-side.
 *
 * @param objectKey - The storage key for the object
 * @param data - File data (Buffer, ArrayBuffer, or Uint8Array)
 * @param mimeType - MIME type
 * @returns Public URL of uploaded file
 */
export async function uploadFile(
  objectKey: string,
  data: Buffer | ArrayBuffer | Uint8Array,
  mimeType: string
): Promise<string> {
  if (!isStorageConfigured()) {
    throw new Error("Storage is not configured");
  }

  const config = getConfig();
  const client = createS3Client();

  const buffer = Buffer.isBuffer(data)
    ? data
    : Buffer.from(data instanceof ArrayBuffer ? new Uint8Array(data) : data);

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: objectKey,
    Body: buffer,
    ContentType: mimeType,
    CacheControl: "public, max-age=31536000, immutable",
  });

  await client.send(command);

  return getPublicUrl(objectKey);
}

/**
 * Delete an object from storage
 */
export async function deleteObject(objectKey: string): Promise<void> {
  if (!isStorageConfigured()) {
    throw new Error("Storage is not configured");
  }

  const config = getConfig();
  const client = createS3Client();

  const command = new DeleteObjectCommand({
    Bucket: config.bucket,
    Key: objectKey,
  });

  await client.send(command);
}

/**
 * Parse base64 data URL to extract mime type and buffer
 *
 * @param dataUrl - Data URL string (e.g., "data:image/png;base64,...")
 * @returns Object with mimeType and data Buffer
 */
export function parseDataUrl(dataUrl: string): {
  mimeType: string;
  data: Buffer;
} | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    return null;
  }

  return {
    mimeType: match[1],
    data: Buffer.from(match[2], "base64"),
  };
}
