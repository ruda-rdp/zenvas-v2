/**
 * API: /api/upload
 * Simple file upload for posters/images
 * Uses base64 encoding for simplicity (Phase 1)
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit for base64 storage

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

    // For Phase 1, return the base64 as a data URL
    // In production, this would upload to S3/Cloudinary
    const mimeType = type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${file}`;

    return NextResponse.json({ 
      url: dataUrl,
      filename: filename,
      type: mimeType,
      message: "Upload successful"
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Upload failed: ${message}` }, { status: 500 });
  }
}
