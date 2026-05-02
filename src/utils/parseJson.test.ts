import { describe, expect, it } from 'vitest';
import { parseJson } from './parseJson';

describe('parseJson', () => {
  it('returns a JSON value for valid input', () => {
    const result = parseJson('{ "name": "Schema Studio", "published": true }');

    expect(result).toEqual({
      ok: true,
      value: {
        name: 'Schema Studio',
        published: true,
      },
      empty: false,
    });
  });

  it('reports empty input without throwing', () => {
    const result = parseJson('   ');

    expect(result.ok).toBe(false);
    expect(result.empty).toBe(true);
  });

  it('reports invalid JSON with a friendly prefix', () => {
    const result = parseJson('{ broken');

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error('Expected invalid JSON result');
    }

    expect(result.empty).toBe(false);
    expect(result.error).toMatch(/^Invalid JSON:/);
  });
});
