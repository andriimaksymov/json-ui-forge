import type { ReactNode } from 'react';
import type { JSONValue, JSONObject } from '../types/schema';
import { getStringRenderHint, svgMarkupToDataUrl } from '../utils/renderHints';

interface GeneratedTableProps {
  value: JSONValue;
}

export function GeneratedTable({ value }: GeneratedTableProps) {
  if (Array.isArray(value)) {
    return <ArrayTable value={value} />;
  }

  if (isObject(value)) {
    return <ObjectTable value={value} />;
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase text-slate-500">Primitive value</p>
      <div className="mt-2 break-words rounded-lg bg-slate-50 p-3 font-mono text-sm text-slate-900">
        <CellValue value={value} />
      </div>
    </section>
  );
}

function ArrayTable({ value }: { value: JSONValue[] }) {
  if (value.length === 0) {
    return <EmptyTable message="This array is empty." />;
  }

  const objectRows = value.filter(isObject);
  const isObjectArray = objectRows.length === value.length;

  if (!isObjectArray) {
    return (
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-3 py-3">Index</th>
              <th className="px-3 py-3">Value</th>
              <th className="px-3 py-3">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {value.map((item, index) => (
              <tr key={index}>
                <td className="px-3 py-3 font-mono text-xs text-slate-500">{index}</td>
                <td className="max-w-md break-words px-3 py-3 align-top font-mono text-sm text-slate-900">
                  <CellValue value={item} />
                </td>
                <td className="px-3 py-3 text-slate-600">{getValueType(item)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const columns = Array.from(new Set(objectRows.flatMap((row) => Object.keys(row))));

  if (columns.length === 0) {
    return <EmptyTable message="Objects in this array do not have fields yet." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column} className="whitespace-nowrap px-3 py-3">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {objectRows.map((row, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td
                  key={column}
                  className="max-w-xs break-words px-3 py-3 align-top font-mono text-sm text-slate-900"
                >
                  {Object.prototype.hasOwnProperty.call(row, column) ? (
                    <CellValue value={row[column]} />
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ObjectTable({ value }: { value: JSONObject }) {
  const entries = Object.entries(value);

  if (entries.length === 0) {
    return <EmptyTable message="This object does not have fields yet." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
          <tr>
            <th className="px-3 py-3">Key</th>
            <th className="px-3 py-3">Value</th>
            <th className="px-3 py-3">Type</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {entries.map(([key, item]) => (
            <tr key={key}>
              <td className="whitespace-nowrap px-3 py-3 font-medium text-slate-900">{key}</td>
              <td className="max-w-md break-words px-3 py-3 align-top font-mono text-sm text-slate-900">
                <CellValue value={item} />
              </td>
              <td className="px-3 py-3 text-slate-600">{getValueType(item)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyTable({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
      {message}
    </div>
  );
}

function CellValue({ value }: { value: JSONValue }) {
  return <>{renderCellValue(value)}</>;
}

function renderCellValue(value: JSONValue): ReactNode {
  if (value === null) {
    return 'null';
  }

  if (typeof value === 'string') {
    return <StringCell value={value} />;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return JSON.stringify(value);
}

function StringCell({ value }: { value: string }) {
  const hint = getStringRenderHint(value);

  if (hint === 'image-url') {
    return (
      <div className="space-y-2">
        <img
          src={value}
          alt="String URL preview"
          className="max-h-32 min-w-48 rounded-md border border-slate-200 object-cover"
        />
        <span className="block break-all text-xs text-slate-500">{value}</span>
      </div>
    );
  }

  if (hint === 'svg-markup') {
    return (
      <div className="space-y-2">
        <img
          src={svgMarkupToDataUrl(value)}
          alt="Inline SVG preview"
          className="max-h-24 min-w-40 rounded-md border border-slate-200 bg-slate-50 object-contain p-2"
        />
        <span className="block break-all text-xs text-slate-500">{shorten(value)}</span>
      </div>
    );
  }

  if (hint === 'url') {
    return (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="break-all font-sans font-medium text-teal-700"
      >
        {value}
      </a>
    );
  }

  if (hint === 'emoji') {
    return <span className="font-sans text-3xl leading-none">{value}</span>;
  }

  return value;
}

function shorten(value: string): string {
  return value.length > 120 ? `${value.slice(0, 117)}...` : value;
}

function getValueType(value: JSONValue): string {
  if (value === null) {
    return 'null';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  return typeof value;
}

function isObject(value: JSONValue): value is JSONObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
