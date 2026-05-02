import { useEffect, useMemo, useState } from 'react';
import { CodeBlock } from './components/CodeBlock';
import { ErrorMessage } from './components/ErrorMessage';
import { GeneratedForm } from './components/GeneratedForm';
import { GeneratedTable } from './components/GeneratedTable';
import { Header } from './components/Header';
import { JsonEditor } from './components/JsonEditor';
import { PreviewTabs, type PreviewTabId } from './components/PreviewTabs';
import type { JSONValue, SchemaNode, SchemaPath } from './types/schema';
import { detectSchema } from './utils/detectSchema';
import { generateReactComponent } from './utils/generateReactComponent';
import { generateTypeScript } from './utils/generateTypeScript';
import { parseJson, type ParseJsonResult } from './utils/parseJson';
import { updateNestedValue } from './utils/updateNestedValue';

const EXAMPLE_JSON = `{
  "appName": "Schema Studio",
  "headline": "Generate UI from JSON",
  "emoji": "✨",
  "version": 1,
  "published": true,
  "imageUrl": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 360'%3E%3Crect width='640' height='360' rx='32' fill='%230f172a'/%3E%3Ccircle cx='320' cy='180' r='92' fill='%2314b8a6'/%3E%3Ctext x='320' y='199' text-anchor='middle' font-size='54' font-family='Arial' fill='white'%3EJSON UI%3C/text%3E%3C/svg%3E",
  "badgeSvg": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 52'><rect width='180' height='52' rx='14' fill='#0f766e'/><text x='90' y='34' text-anchor='middle' font-family='Arial' font-size='20' font-weight='700' fill='white'>JSON → UI</text></svg>",
  "links": {
    "website": "https://example.dev/json-ui",
    "docs": "https://example.dev/docs"
  },
  "features": ["Editable forms", "Table previews", "TypeScript output", "React code"],
  "screens": [
    {
      "title": "Form generator",
      "status": "ready",
      "icon": "🧩",
      "fields": 12
    },
    {
      "title": "Code export",
      "status": "beta",
      "icon": "💻",
      "fields": 4
    }
  ],
  "releaseNotes": ["Fast parsing", "Copyable code", null],
  "deprecatedAt": null
}`;

const initialParseResult = parseJson(EXAMPLE_JSON);
const initialJson = initialParseResult.ok ? initialParseResult.value : undefined;

export default function App() {
  const [rawJson, setRawJson] = useState(EXAMPLE_JSON);
  const [parseResult, setParseResult] = useState<ParseJsonResult>(initialParseResult);
  const [schema, setSchema] = useState<SchemaNode | null>(
    initialJson !== undefined ? detectSchema(initialJson) : null,
  );
  const [editedJson, setEditedJson] = useState<JSONValue | undefined>(initialJson);
  const [activeTab, setActiveTab] = useState<PreviewTabId>('form');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const result = parseJson(rawJson);
      setParseResult(result);

      if (result.ok) {
        setSchema(detectSchema(result.value));
        setEditedJson(result.value);
      } else {
        setSchema(null);
        setEditedJson(undefined);
      }
    }, 280);

    return () => window.clearTimeout(timeoutId);
  }, [rawJson]);

  const typeScriptCode = useMemo(() => (schema ? generateTypeScript(schema) : ''), [schema]);
  const reactCode = useMemo(() => (schema ? generateReactComponent(schema) : ''), [schema]);
  const jsonOutput = useMemo(
    () => (editedJson !== undefined ? JSON.stringify(editedJson, null, 2) : ''),
    [editedJson],
  );

  const handleFormat = () => {
    const result = parseJson(rawJson);
    setParseResult(result);

    if (result.ok) {
      const formatted = JSON.stringify(result.value, null, 2);
      setRawJson(formatted);
      setSchema(detectSchema(result.value));
      setEditedJson(result.value);
    }
  };

  const handleClear = () => {
    setRawJson('');
    setParseResult({
      ok: false,
      empty: true,
      error: 'Paste JSON to generate a form, table, and code.',
    });
    setSchema(null);
    setEditedJson(undefined);
  };

  const handleUseExample = () => {
    setRawJson(EXAMPLE_JSON);
  };

  const handleFormChange = (path: SchemaPath, nextValue: JSONValue) => {
    setEditedJson((current) => {
      if (current === undefined) {
        return current;
      }

      return updateNestedValue(current, path, nextValue);
    });
  };

  const hasPreview = parseResult.ok && schema !== null && editedJson !== undefined;

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <Header />
      <main className="mx-auto grid w-full max-w-[1440px] gap-4 px-4 py-4 md:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <JsonEditor
          value={rawJson}
          error={!parseResult.ok ? parseResult.error : undefined}
          isEmpty={!parseResult.ok && parseResult.empty}
          isValid={parseResult.ok}
          onChange={setRawJson}
          onFormat={handleFormat}
          onClear={handleClear}
          onUseExample={handleUseExample}
        />

        <PreviewTabs activeTab={activeTab} onChange={setActiveTab}>
          {hasPreview ? (
            <PreviewContent
              activeTab={activeTab}
              schema={schema}
              editedJson={editedJson}
              typeScriptCode={typeScriptCode}
              reactCode={reactCode}
              jsonOutput={jsonOutput}
              onFormChange={handleFormChange}
            />
          ) : (
            <EmptyPreview
              error={!parseResult.ok && !parseResult.empty ? parseResult.error : undefined}
            />
          )}
        </PreviewTabs>
      </main>
    </div>
  );
}

function PreviewContent({
  activeTab,
  schema,
  editedJson,
  typeScriptCode,
  reactCode,
  jsonOutput,
  onFormChange,
}: {
  activeTab: PreviewTabId;
  schema: SchemaNode;
  editedJson: JSONValue;
  typeScriptCode: string;
  reactCode: string;
  jsonOutput: string;
  onFormChange: (path: SchemaPath, value: JSONValue) => void;
}) {
  switch (activeTab) {
    case 'form':
      return <GeneratedForm value={editedJson} schema={schema} onChange={onFormChange} />;
    case 'table':
      return <GeneratedTable value={editedJson} />;
    case 'typescript':
      return (
        <CodeBlock code={typeScriptCode} label="TypeScript output" copyLabel="Copy TypeScript" />
      );
    case 'react':
      return (
        <CodeBlock code={reactCode} label="React component output" copyLabel="Copy React Code" />
      );
    case 'json':
      return <CodeBlock code={jsonOutput} label="Edited JSON output" copyLabel="Copy JSON" />;
  }
}

function EmptyPreview({ error }: { error?: string }) {
  return (
    <div className="flex min-h-[28rem] items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6">
      <div className="max-w-md text-center">
        <h2 className="text-lg font-semibold text-slate-950">Your generated UI will appear here</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Paste valid JSON to generate an editable form, table preview, TypeScript interfaces, and
          React code.
        </p>
        {error ? (
          <div className="mt-4 text-left">
            <ErrorMessage message={error} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
