/**
 * Validation Utilities
 *
 * Helper functions for parsing and handling Zod validation errors.
 */

import { NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";

/**
 * Parse request body and return either parsed data or a 400 NextResponse
 */
export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const response = createValidationErrorResponse(parsed.error);
      return { success: false, response };
    }

    return { success: true, data: parsed.data };
  } catch (error) {
    // JSON parse error
    return {
      success: false,
      response: NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      ),
    };
  }
}

/**
 * Create a structured validation error response
 */
export function createValidationErrorResponse(error: ZodError): NextResponse {
  const fieldErrors = error.flatten().fieldErrors;

  return NextResponse.json(
    {
      error: "Validation failed",
      details: fieldErrors,
      message: formatZodError(error),
    },
    { status: 400 }
  );
}

/**
 * Format Zod error into a human-readable message
 */
function formatZodError(error: ZodError): string {
  const issues = error.issues;
  if (issues.length === 0) return "Validation failed";

  if (issues.length === 1) {
    return issues[0].message;
  }

  return `${issues.length} validation errors: ${issues
    .slice(0, 3)
    .map((i) => i.message)
    .join(", ")}${issues.length > 3 ? "..." : ""}`;
}

/**
 * Re-export all schemas
 */
export * from "./schemas";
