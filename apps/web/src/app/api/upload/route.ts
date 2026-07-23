/**
 * API: /api/upload
 * File upload for posters/images
 * 
 * Per CONSTITUTION.md Rule #10 (revised): Zenvas MAY manage its own object storage
 * (S3/R2/Cloudinary-compatible) OR use links/references to external storage.
 * Object storage is infrastructure, not a product surface.
 * 
 * TODO(ZEN-UPLOAD): Replace base64 passthrough with real object storage.
 * Options:
 *   1. Server-side upload: Use @aws-sdk/client-s3 with env-configured bucket
 *   2. Presigned URL flow: Generate presigned URL, client uploads directly
 *   Until implemented, base64 data URLs are returned (5MB limit, not production-ready).
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { file, filename, type } = body;

    if (!file) {
      return NextResponse.json({ error: "File data is required" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (type && !allowedTypes.includes(type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP" 
      }, { status: 400 });
    }

    // Check file size (rough estimate from base64)
    const fileSize = (file.length * 3) / 4; // base64 is ~4/3 of original
    if (fileSize > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is 5MB` 
      }, { status: 400 });
    }

    // TODO(ZEN-UPLOAD): Replace with real object storage
    // Current implementation is base64 passthrough - not suitable for production
    const mimeType = type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${file}`;

    return NextResponse.json({ 
      url: dataUrl,
      filename: filename,
      type: mimeType,
      message: "Upload successful (base64 passthrough - see TODO)"
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Upload failed: ${message}` }, { status: 500 });
  }
}
