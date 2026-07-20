/**
 * API: /api/upload
 * Simple file upload for posters/images
 * Uses base64 encoding for simplicity (Phase 1)
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { file, filename, type } = body;

    if (!file || !filename) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (type && !allowedTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // For Phase 1, return the base64 as a data URL
    // In production, this would upload to S3/Cloudinary
    const dataUrl = `data:${type || "image/jpeg"};base64,${file}`;

    return NextResponse.json({ 
      url: dataUrl,
      message: "Upload successful (stored as base64 for Phase 1)"
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
