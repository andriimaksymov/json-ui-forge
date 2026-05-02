import { describe, expect, it } from 'vitest';
import { detectSchema } from './detectSchema';
import { generateReactComponent } from './generateReactComponent';

describe('generateReactComponent', () => {
  it('emits a self-contained controlled form component', () => {
    const schema = detectSchema({
      title: 'Form generator',
      published: true,
      metrics: {
        fields: 12,
      },
    });

    const code = generateReactComponent(schema);

    expect(code).toContain('export function GeneratedForm');
    expect(code).toContain('const [formData, setFormData]');
    expect(code).toContain('onSubmit?.(formData)');
    expect(code).toContain('updateField(["title"], event.target.value)');
    expect(code).toContain('updateField(["published"], event.target.checked)');
    expect(code).toContain('updateField(["metrics", "fields"], toNumber(event.target.value))');
  });

  it('handles object fields named index without confusing them for loop indexes', () => {
    const schema = detectSchema({
      rows: [
        {
          index: 1,
        },
      ],
    });

    const code = generateReactComponent(schema);

    expect(code).toContain('updateField(["rows", index, "index"], toNumber(event.target.value))');
  });
});
