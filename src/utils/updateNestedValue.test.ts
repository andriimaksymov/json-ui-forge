import { describe, expect, it } from 'vitest';
import type { JSONObject } from '../types/schema';
import { updateNestedValue } from './updateNestedValue';

describe('updateNestedValue', () => {
  it('updates nested object values immutably', () => {
    const input: JSONObject = {
      profile: {
        website: 'https://example.dev',
      },
    };

    const output = updateNestedValue(input, ['profile', 'website'], 'https://docs.example.dev');

    expect(output).toEqual({
      profile: {
        website: 'https://docs.example.dev',
      },
    });
    expect(output).not.toBe(input);
    expect((output as JSONObject).profile).not.toBe(input.profile);
  });

  it('updates nested array values immutably', () => {
    const input: JSONObject = {
      screens: [{ title: 'Form generator' }, { title: 'Code export' }],
    };

    const output = updateNestedValue(input, ['screens', 1, 'title'], 'React code export');

    expect(output).toEqual({
      screens: [{ title: 'Form generator' }, { title: 'React code export' }],
    });
    expect(output).not.toBe(input);
    expect((output as JSONObject).screens).not.toBe(input.screens);
  });
});
