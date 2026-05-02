import { describe, expect, it } from 'vitest';
import { detectSchema } from './detectSchema';

describe('detectSchema', () => {
  it('detects nested object and array fields', () => {
    const schema = detectSchema({
      title: 'Schema Studio',
      version: 1,
      published: true,
      tags: ['forms', 'tables'],
      meta: {
        icon: '✨',
      },
    });

    expect(schema.kind).toBe('object');

    if (schema.kind !== 'object') {
      throw new Error('Expected object schema');
    }

    expect(schema.fields.title.kind).toBe('string');
    expect(schema.fields.version.kind).toBe('number');
    expect(schema.fields.published.kind).toBe('boolean');
    expect(schema.fields.meta.kind).toBe('object');
    expect(schema.fields.tags.kind).toBe('array');
  });

  it('merges array object keys and marks missing fields optional', () => {
    const schema = detectSchema([
      { name: 'Form generator', fields: 12 },
      { name: 'Code export', status: 'beta' },
    ]);

    expect(schema.kind).toBe('array');

    if (schema.kind !== 'array' || schema.item?.kind !== 'object') {
      throw new Error('Expected array of objects');
    }

    expect(schema.item.fields.name.optional).toBe(false);
    expect(schema.item.fields.fields.optional).toBe(true);
    expect(schema.item.fields.status.optional).toBe(true);
  });

  it('detects mixed arrays', () => {
    const schema = detectSchema(['Fast parsing', null, 7]);

    expect(schema.kind).toBe('array');

    if (schema.kind !== 'array') {
      throw new Error('Expected array schema');
    }

    expect(schema.isMixed).toBe(true);
    expect(schema.item?.kind).toBe('mixed');
  });
});
