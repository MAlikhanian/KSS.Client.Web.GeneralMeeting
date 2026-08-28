import { NextResponse } from 'next/server';

/**
 * Extract HTTP status code and clean message from an error thrown by service functions.
 *
 * Service functions throw errors containing the backend's JSON response body, e.g.:
 *   {"statusCode":400,"message":"Cannot delete the original name...","details":null}
 *
 * This function:
 * 1. Tries to parse the error message as JSON and extract `statusCode` + `message`
 * 2. Falls back to regex extraction of trailing status code (e.g. ": 401")
 */
function extractErrorInfo(error: unknown): { status: number; message: string } {
  if (!(error instanceof Error)) {
    return { status: 500, message: 'Something went wrong.' };
  }

  // Try to parse backend JSON response: {"statusCode":400,"message":"...","details":...}
  try {
    const parsed = JSON.parse(error.message);
    if (parsed && typeof parsed.message === 'string' && typeof parsed.statusCode === 'number') {
      return { status: parsed.statusCode, message: parsed.message };
    }
  } catch {
    // Not JSON — fall through to regex
  }

  // Fallback: match patterns like ": 401", ": 403", ": 404", ": 500"
  const match = error.message.match(/:\s*(\d{3})\s*$/);
  if (match) {
    return { status: parseInt(match[1], 10), message: error.message };
  }

  return { status: 500, message: error.message };
}

/**
 * Create a NextResponse.json error response from a caught error.
 * Properly propagates status codes and clean messages from backend microservices.
 *
 * Backend BusinessRuleException → HTTP 400 + clean message → user notification.
 */
export function apiErrorResponse(error: unknown, context?: string): NextResponse {
  if (context) {
    console.error(`Error in ${context}:`, error);
  }

  const { status, message } = extractErrorInfo(error);

  return NextResponse.json(
    { message: status === 401 ? 'Unauthorized' : message },
    { status },
  );
}
