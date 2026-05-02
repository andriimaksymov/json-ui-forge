import type { SchemaNode } from '../types/schema';
import { generateTypeScript } from './generateTypeScript';

type CodePathSegment =
  | {
      kind: 'literal';
      value: string | number;
    }
  | {
      kind: 'expression';
      value: string;
    };

type CodePath = CodePathSegment[];

export function generateReactComponent(schema: SchemaNode): string {
  const interfaces = generateTypeScript(schema);
  const formFields = renderField(schema, 'Root', []);

  return `import { FormEvent, useState } from 'react';

${interfaces}

interface GeneratedFormProps {
  initialData: Root;
  onSubmit?: (data: Root) => void;
}

type PathSegment = string | number;
type JSONFormValue = string | number | boolean | null | JSONFormValue[] | { [key: string]: JSONFormValue };

export function GeneratedForm({ initialData, onSubmit }: GeneratedFormProps) {
  const [formData, setFormData] = useState<Root>(initialData);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit?.(formData);
  };

  const updateField = (path: PathSegment[], value: JSONFormValue) => {
    setFormData((current) => updateNestedValue(current as JSONFormValue, path, value) as Root);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
${indent(formFields, 6)}
      <button
        type="submit"
        className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
      >
        Submit
      </button>
    </form>
  );
}

function readValue(value: unknown, path: PathSegment[]): unknown {
  return path.reduce<unknown>((current, segment) => {
    if (Array.isArray(current) && typeof segment === 'number') {
      return current[segment];
    }

    if (isRecord(current) && typeof segment === 'string') {
      return current[segment];
    }

    return undefined;
  }, value);
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function readNumber(value: unknown): number | '' {
  return typeof value === 'number' && Number.isFinite(value) ? value : '';
}

function readBoolean(value: unknown): boolean {
  return typeof value === 'boolean' ? value : false;
}

function readArray(value: unknown): JSONFormValue[] {
  return Array.isArray(value) ? (value as JSONFormValue[]) : [];
}

function toNumber(value: string): number {
  if (value.trim() === '') {
    return 0;
  }

  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : 0;
}

function updateNestedValue(value: JSONFormValue, path: PathSegment[], nextValue: JSONFormValue): JSONFormValue {
  if (path.length === 0) {
    return nextValue;
  }

  const [segment, ...remainingPath] = path;

  if (Array.isArray(value) && typeof segment === 'number') {
    return value.map((item, index) =>
      index === segment ? updateNestedValue(item, remainingPath, nextValue) : item,
    );
  }

  if (isRecord(value) && typeof segment === 'string') {
    return {
      ...value,
      [segment]: updateNestedValue(value[segment] ?? null, remainingPath, nextValue),
    };
  }

  return value;
}

function isRecord(value: unknown): value is { [key: string]: JSONFormValue } {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
`;
}

function renderField(schema: SchemaNode, label: string, path: CodePath): string {
  switch (schema.kind) {
    case 'string':
      return renderStringField(label, path);
    case 'number':
      return renderNumberField(label, path);
    case 'boolean':
      return renderBooleanField(label, path);
    case 'null':
      return renderNullField(label);
    case 'object':
      return renderObjectField(schema, label, path);
    case 'array':
      return renderArrayField(schema, label, path);
    case 'mixed':
      return renderMixedField(label, path);
  }
}

function renderStringField(label: string, path: CodePath): string {
  const pathExpression = toPathExpression(path);

  return `<label className="block space-y-1">
  <span className="text-sm font-medium text-slate-700">${escapeJsxText(label)}</span>
  <input
    type="text"
    value={readString(readValue(formData, ${pathExpression}))}
    onChange={(event) => updateField(${pathExpression}, event.target.value)}
    className="w-full rounded-md border border-slate-300 px-3 py-2"
  />
</label>`;
}

function renderNumberField(label: string, path: CodePath): string {
  const pathExpression = toPathExpression(path);

  return `<label className="block space-y-1">
  <span className="text-sm font-medium text-slate-700">${escapeJsxText(label)}</span>
  <input
    type="number"
    value={readNumber(readValue(formData, ${pathExpression}))}
    onChange={(event) => updateField(${pathExpression}, toNumber(event.target.value))}
    className="w-full rounded-md border border-slate-300 px-3 py-2"
  />
</label>`;
}

function renderBooleanField(label: string, path: CodePath): string {
  const pathExpression = toPathExpression(path);

  return `<label className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2">
  <input
    type="checkbox"
    checked={readBoolean(readValue(formData, ${pathExpression}))}
    onChange={(event) => updateField(${pathExpression}, event.target.checked)}
  />
  <span className="text-sm font-medium text-slate-700">${escapeJsxText(label)}</span>
</label>`;
}

function renderNullField(label: string): string {
  return `<label className="block space-y-1">
  <span className="text-sm font-medium text-slate-700">${escapeJsxText(label)}</span>
  <input disabled value="null" className="w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2" />
</label>`;
}

function renderObjectField(schema: SchemaNode, label: string, path: CodePath): string {
  if (schema.kind !== 'object') {
    return '';
  }

  const fields = Object.entries(schema.fields)
    .map(([key, fieldSchema]) => renderField(fieldSchema, humanizeKey(key), [...path, literalPathSegment(key)]))
    .join('\n\n');

  return `<fieldset className="space-y-3 rounded-md border border-slate-200 p-4">
  <legend className="px-1 text-sm font-semibold text-slate-900">${escapeJsxText(label)}</legend>
${indent(fields, 2)}
</fieldset>`;
}

function renderArrayField(schema: SchemaNode, label: string, path: CodePath): string {
  if (schema.kind !== 'array') {
    return '';
  }

  const pathExpression = toPathExpression(path);

  if (!schema.item) {
    return `<section className="rounded-md border border-slate-200 p-4">
  <h3 className="text-sm font-semibold text-slate-900">${escapeJsxText(label)}</h3>
  <p className="mt-2 text-sm text-slate-500">Empty array</p>
</section>`;
  }

  if (schema.item.kind === 'object') {
    const fields = Object.entries(schema.item.fields)
      .map(([key, fieldSchema]) =>
        renderField(fieldSchema, humanizeKey(key), [
          ...path,
          expressionPathSegment('index'),
          literalPathSegment(key),
        ]),
      )
      .join('\n\n');

    return `<section className="space-y-3 rounded-md border border-slate-200 p-4">
  <h3 className="text-sm font-semibold text-slate-900">${escapeJsxText(label)}</h3>
  {readArray(readValue(formData, ${pathExpression})).map((_, index) => (
    <fieldset key={index} className="space-y-3 rounded-md border border-slate-200 p-3">
      <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        ${escapeJsxText(label)} {index + 1}
      </legend>
${indent(fields, 6)}
    </fieldset>
  ))}
</section>`;
  }

  const itemInput = renderArrayItemField(schema.item, path);

  return `<section className="space-y-3 rounded-md border border-slate-200 p-4">
  <h3 className="text-sm font-semibold text-slate-900">${escapeJsxText(label)}</h3>
  {readArray(readValue(formData, ${pathExpression})).map((_, index) => (
    <div key={index} className="rounded-md border border-slate-200 p-3">
${indent(itemInput, 6)}
    </div>
  ))}
</section>`;
}

function renderArrayItemField(schema: SchemaNode, parentPath: CodePath): string {
  const itemPath = [...parentPath, expressionPathSegment('index')];

  if (schema.kind === 'string') {
    return renderStringField('Item', itemPath);
  }

  if (schema.kind === 'number') {
    return renderNumberField('Item', itemPath);
  }

  if (schema.kind === 'boolean') {
    return renderBooleanField('Item', itemPath);
  }

  return renderMixedField('Item', itemPath);
}

function renderMixedField(label: string, path: CodePath): string {
  const pathExpression = toPathExpression(path);

  return `<label className="block space-y-1">
  <span className="text-sm font-medium text-slate-700">${escapeJsxText(label)}</span>
  <input
    type="text"
    value={String(readValue(formData, ${pathExpression}) ?? '')}
    onChange={(event) => updateField(${pathExpression}, event.target.value)}
    className="w-full rounded-md border border-slate-300 px-3 py-2"
  />
</label>`;
}

function toPathExpression(path: CodePath): string {
  if (path.length === 0) {
    return '[]';
  }

  const segments = path.map((segment) =>
    segment.kind === 'expression' ? segment.value : JSON.stringify(segment.value),
  );

  return `[${segments.join(', ')}]`;
}

function literalPathSegment(value: string | number): CodePathSegment {
  return {
    kind: 'literal',
    value,
  };
}

function expressionPathSegment(value: string): CodePathSegment {
  return {
    kind: 'expression',
    value,
  };
}

function humanizeKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (character) => character.toUpperCase());
}

function escapeJsxText(value: string): string {
  return value.replace(/[{}<>]/g, '');
}

function indent(value: string, spaces: number): string {
  const padding = ' '.repeat(spaces);
  return value
    .split('\n')
    .map((line) => (line ? `${padding}${line}` : line))
    .join('\n');
}
