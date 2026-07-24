/**
 * API: /api/upload
 * File upload for posters/images
 *
 * Per CONSTITUTION.md Rule #10 (v1.3): Zenvas MAY manage its own object storage.
 *
 * This implementation uses presigned URLs for efficient large file handling:
 * 1. Client requests upload URL from this endpoint
 * 2. Server returns presigned PUT URL + final public URL
 * 3. Client uploads file directly to object storage
 * 4. Client uses final public URL to save reference in DB
 *
 * This avoids passing large files through the Next.js server.
 *
 * Required env vars:
 * - S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_PUBLIC_BASE_URL
 * - UPLOAD_MAX_MB (optional, default: 15)
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  isStorageConfigured,
  generatePresignedUploadUrl,
  generateObjectKey,
  validateUpload,
  ALLOWED_TYPES,
} from "@/lib/storage";

/**
 * GET /api/upload - Get presigned upload URL
 *
 * Request body:
 * - filename: Original filename
 * - mimeType: File MIME type
 * - size: File size in bytes
 *
 * Response:
 * - presignedUrl: URL to PUT the file to
 * - publicUrl: Final URL where the file will be accessible
 * - expiresIn: How long the presigned URL is valid (seconds)
 */
export async function GET(request: Request) {
  // Check if storage is configured
  if (!isStorageConfigured()) {
    return NextResponse.json(
      {
        error: "Object storage not configured",
        message:
          "S3/R2 storage is not set up. Please configure S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY environment variables.",
        code: "STORAGE_NOT_CONFIGURED",
      },
      { status: 503 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");
    const mimeType = searchParams.get("type") || "image/jpeg";
    const sizeParam = searchParams.get("size");
    const size = sizeParam ? parseInt(sizeParam, 10) : 0;

    if (!filename) {
      return NextResponse.json(
        { error: "filename parameter is required" },
        { status: 400 }
      );
    }

    // Validate file
    const validation = validateUpload(mimeType, size);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Generate object key
    const objectKey = generateObjectKey(filename, "posters");

    // Generate presigned URL
    const { presignedUrl, publicUrl } = await generatePresignedUploadUrl(
      objectKey,
      mimeType,
      3600 // 1 hour
    );

    return NextResponse.json({
      presignedUrl,
      publicUrl,
      objectKey,
      expiresIn: 3600,
      method: "PUT",
      headers: {
        "Content-Type": mimeType,
      },
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to generate upload URL: ${message}` },
      { status: 500 }
    );
  }
}

/**
 * POST /api/upload - Legacy endpoint for small files / direct upload
 *
 * For backwards compatibility and small files (< 1MB),
 * this endpoint accepts base64-encoded files and uploads them server-side.
 *
 * New clients should use GET to get a presigned URL instead.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if storage is configured
  if (!isStorageConfigured()) {
    return NextResponse.json(
      {
        error: "Object storage not configured",
        message:
          "S3/R2 storage is not set up. Please configure S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY environment variables.",
        code: "STORAGE_NOT_CONFIGURED",
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { file, filename, type } = body;

    if (!file) {
      return NextResponse.json(
        { error: "File data is required" },
        { status: 400 }
      );
    }

    const mimeType = type || "image/jpeg";

    // Validate file type
    if (!ALLOWED_TYPES.includes(mimeType as typeof ALLOWED_TYPES[number])) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Parse base64 data
    const base64Match = file.match(/^data:[^;]+;base64,(.+)$/);
    const base64Data = base64Match ? base64Match[1] : file;

    // Estimate size from base64
    const estimatedSize = (base64Data.length * 3) / 4;
    const maxSize = 1 * 1024 * 1024; // 1MB for legacy endpoint

    if (estimatedSize > maxSize) {
      return NextResponse.json(
        {
          error: `File too large for direct upload. Maximum size is 1MB. Use GET endpoint for presigned URL upload (supports up to 15MB).`,
          maxSizeMb: 1,
          suggestion: "GET /api/upload?filename=x&type=y&size=z for large files",
        },
        { status: 400 }
      );
    }

    // Upload file
    const { uploadFile, getPublicUrl, generateObjectKey } = await import(
      "@/lib/storage"
    );

    const objectKey = generateObjectKey(
      filename || "upload",
      "uploads"
    );
    const data = Buffer.from(base64Data, "base64");
    const publicUrl = await uploadFile(objectKey, data, mimeType);

    return NextResponse.json({
      url: publicUrl,
      filename: filename,
      type: mimeType,
      objectKey,
      message: "Upload successful",
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Upload failed: ${message}` },
      { status: 500 }
    );
  }
}
