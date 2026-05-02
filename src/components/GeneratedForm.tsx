import { Plus, X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { JSONArray, JSONObject, JSONValue, SchemaNode, SchemaPath } from '../types/schema';
import { getStringRenderHint, svgMarkupToDataUrl } from '../utils/renderHints';

interface GeneratedFormProps {
  value: JSONValue;
  schema: SchemaNode;
  onChange: (path: SchemaPath, value: JSONValue) => void;
}

export function GeneratedForm({ value, schema, onChange }: GeneratedFormProps) {
  return (
    <div className="space-y-4">
      <FormNode label="Root" value={value} schema={schema} path={[]} onChange={onChange} />
    </div>
  );
}

interface FormNodeProps {
  label: string;
  value: JSONValue | undefined;
  schema: SchemaNode;
  path: SchemaPath;
  onChange: (path: SchemaPath, value: JSONValue) => void;
}

function FormNode({ label, value, schema, path, onChange }: FormNodeProps) {
  switch (schema.kind) {
    case 'string':
      const stringValue = typeof value === 'string' ? value : '';

      return (
        <FieldShell label={label} type="string">
          <input
            type="text"
            value={stringValue}
            onChange={(event) => onChange(path, event.target.value)}
            className={inputClassName}
          />
          <StringPreview value={stringValue} />
        </FieldShell>
      );
    case 'number':
      return (
        <FieldShell label={label} type="number">
          <input
            type="number"
            value={typeof value === 'number' && Number.isFinite(value) ? value : ''}
            onChange={(event) => onChange(path, toNumber(event.target.value))}
            className={inputClassName}
          />
        </FieldShell>
      );
    case 'boolean':
      return (
        <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white px-3 py-3">
          <span>
            <span className="block text-sm font-medium text-slate-900">{label}</span>
            <span className="text-xs text-slate-500">boolean</span>
          </span>
          <input
            type="checkbox"
            checked={typeof value === 'boolean' ? value : false}
            onChange={(event) => onChange(path, event.target.checked)}
            className="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          />
        </label>
      );
    case 'null':
      return (
        <FieldShell label={label} type="null">
          <input disabled value="null" className={`${inputClassName} bg-slate-100 text-slate-500`} />
        </FieldShell>
      );
    case 'object':
      return (
        <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-950">{label}</h3>
              <p className="text-xs text-slate-500">grouped object</p>
            </div>
          </div>
          <div className="grid gap-3">
            {Object.entries(schema.fields).map(([key, fieldSchema]) => (
              <FormNode
                key={key}
                label={humanizeKey(key)}
                value={isObject(value) ? value[key] : undefined}
                schema={fieldSchema}
                path={[...path, key]}
                onChange={onChange}
              />
            ))}
          </div>
        </section>
      );
    case 'array':
      return (
        <ArrayField
          label={label}
          value={Array.isArray(value) ? value : []}
          schema={schema}
          path={path}
          onChange={onChange}
        />
      );
    case 'mixed':
      return (
        <FieldShell label={label} type="mixed">
          <input
            type="text"
            value={valueToInput(value)}
            onChange={(event) => onChange(path, event.target.value)}
            className={inputClassName}
          />
        </FieldShell>
      );
  }
}

function ArrayField({
  label,
  value,
  schema,
  path,
  onChange,
}: {
  label: string;
  value: JSONArray;
  schema: Extract<SchemaNode, { kind: 'array' }>;
  path: SchemaPath;
  onChange: (path: SchemaPath, value: JSONValue) => void;
}) {
  const itemSchema = schema.item;

  const handleAdd = () => {
    onChange(path, [...value, itemSchema ? createDefaultValue(itemSchema) : '']);
  };

  const handleRemove = (index: number) => {
    onChange(
      path,
      value.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  if (!itemSchema) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">{label}</h3>
            <p className="text-xs text-slate-500">empty array</p>
          </div>
          <button type="button" onClick={handleAdd} className={smallButtonClassName}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add item
          </button>
        </div>
      </section>
    );
  }

  if (itemSchema.kind === 'object') {
    return (
      <section className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">{label}</h3>
            <p className="text-xs text-slate-500">array of objects</p>
          </div>
          <button type="button" onClick={handleAdd} className={smallButtonClassName}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add row
          </button>
        </div>
        {value.length === 0 ? <p className="text-sm text-slate-500">No items yet.</p> : null}
        {value.map((item, index) => (
          <section key={index} className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h4 className="text-sm font-semibold text-slate-800">
                {label} {index + 1}
              </h4>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:text-rose-600"
                aria-label={`Remove ${label} ${index + 1}`}
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(itemSchema.fields).map(([key, fieldSchema]) => (
                <FormNode
                  key={key}
                  label={humanizeKey(key)}
                  value={isObject(item) ? item[key] : undefined}
                  schema={fieldSchema}
                  path={[...path, index, key]}
                  onChange={onChange}
                />
              ))}
            </div>
          </section>
        ))}
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">{label}</h3>
          <p className="text-xs text-slate-500">
            {schema.isMixed ? 'mixed array' : `array of ${itemSchema.kind}`}
          </p>
        </div>
        <button type="button" onClick={handleAdd} className={smallButtonClassName}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add item
        </button>
      </div>
      {value.length === 0 ? <p className="text-sm text-slate-500">No items yet.</p> : null}
      <div className="flex flex-col gap-2">
        {value.map((item, index) => (
          <div key={index} className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-2">
            <div className="flex-1">
              <FormNode
                label={`Item ${index + 1}`}
                value={item}
                schema={itemSchema}
                path={[...path, index]}
                onChange={onChange}
              />
            </div>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="mt-6 inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:text-rose-600"
              aria-label={`Remove item ${index + 1}`}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function FieldShell({ label, type, children }: { label: string; type: string; children: ReactNode }) {
  return (
    <label className="block rounded-lg border border-slate-200 bg-white px-3 py-3">
      <span className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-900">{label}</span>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">{type}</span>
      </span>
      {children}
    </label>
  );
}

function StringPreview({ value }: { value: string }) {
  const hint = getStringRenderHint(value);

  if (hint === 'image-url') {
    return (
      <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        <img src={value} alt="String URL preview" className="max-h-48 w-full object-cover" />
      </div>
    );
  }

  if (hint === 'svg-markup') {
    return (
      <div className="mt-3 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-3">
        <img src={svgMarkupToDataUrl(value)} alt="Inline SVG preview" className="max-h-32 w-full object-contain" />
      </div>
    );
  }

  if (hint === 'url') {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="mt-2 block break-all text-sm font-medium text-teal-700 hover:text-teal-800"
      >
        Open URL
      </a>
    );
  }

  if (hint === 'emoji') {
    return <div className="mt-3 text-4xl leading-none">{value}</div>;
  }

  return null;
}

const inputClassName =
  'w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100';

const smallButtonClassName =
  'inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-700';

function toNumber(value: string): number {
  if (value.trim() === '') {
    return 0;
  }

  const nextValue = Number(value);
  return Number.isFinite(nextValue) ? nextValue : 0;
}

function createDefaultValue(schema: SchemaNode): JSONValue {
  switch (schema.kind) {
    case 'string':
      return '';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'null':
      return null;
    case 'array':
      return [];
    case 'object':
      return Object.entries(schema.fields).reduce<JSONObject>((acc, [key, fieldSchema]) => {
        acc[key] = createDefaultValue(fieldSchema);
        return acc;
      }, {});
    case 'mixed':
      return schema.variants[0] ? createDefaultValue(schema.variants[0]) : null;
  }
}

function valueToInput(value: JSONValue | undefined): string {
  if (value === undefined) {
    return '';
  }

  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return JSON.stringify(value);
}

function humanizeKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (character) => character.toUpperCase());
}

function isObject(value: JSONValue | undefined): value is JSONObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
