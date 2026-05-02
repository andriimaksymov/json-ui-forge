import type { JSONValue } from '../types/schema';

export type ParseJsonResult =
  | {
      ok: true;
      value: JSONValue;
      empty: false;
    }
  | {
      ok: false;
      error: string;
      empty: boolean;
    };

export function parseJson(input: string): ParseJsonResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      ok: false,
      empty: true,
      error: 'Paste JSON to generate a form, table, and code.',
    };
  }

  try {
    const parsed: unknown = JSON.parse(trimmed);

    if (!isJsonValue(parsed)) {
      return {
        ok: false,
        empty: false,
        error: 'The input parsed, but it is not a valid JSON value.',
      };
    }

    return {
      ok: true,
      value: parsed,
      empty: false,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parse error';

    return {
      ok: false,
      empty: false,
      error: `Invalid JSON: ${message}`,
    };
  }
}

function isJsonValue(value: unknown): value is JSONValue {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }

  if (typeof value === 'object') {
    return Object.values(value as Record<string, unknown>).every(isJsonValue);
  }

  return false;
}
