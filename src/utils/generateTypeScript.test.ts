import { describe, expect, it } from 'vitest';
import { detectSchema } from './detectSchema';
import { generateTypeScript } from './generateTypeScript';

describe('generateTypeScript', () => {
  it('generates readable interfaces with nested types', () => {
    const schema = detectSchema({
      appName: 'Schema Studio',
      links: {
        website: 'https://example.dev',
      },
      screens: [
        {
          title: 'Form generator',
          fields: 12,
        },
      ],
    });

    const code = generateTypeScript(schema);

    expect(code).toContain('interface Root');
    expect(code).toContain('appName: string;');
    expect(code).toContain('links: RootLink;');
    expect(code).toContain('screens: RootScreen[];');
    expect(code).toContain('fields: number;');
  });

  it('uses unions for mixed arrays', () => {
    const schema = detectSchema(['Copyable code', null, 3]);
    const code = generateTypeScript(schema);

    expect(code).toBe('type Root = (string | null | number)[];');
  });
});
