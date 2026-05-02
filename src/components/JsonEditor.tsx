import { CheckCircle2, FileJson, RotateCcw, Trash2, Wand2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { ErrorMessage } from './ErrorMessage';

interface JsonEditorProps {
  value: string;
  error?: string;
  isEmpty: boolean;
  isValid: boolean;
  onChange: (value: string) => void;
  onFormat: () => void;
  onClear: () => void;
  onUseExample: () => void;
}

export function JsonEditor({
  value,
  error,
  isEmpty,
  isValid,
  onChange,
  onFormat,
  onClear,
  onUseExample,
}: JsonEditorProps) {
  return (
    <section className="flex min-h-[calc(100vh-9rem)] flex-col rounded-lg border border-slate-200 bg-white shadow-panel">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileJson className="h-5 w-5 text-teal-600" aria-hidden="true" />
            <h2 className="text-base font-semibold text-slate-950">JSON input</h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Paste or edit JSON. Previews update automatically.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <EditorButton
            icon={<Wand2 className="h-4 w-4" />}
            label="Format JSON"
            onClick={onFormat}
          />
          <EditorButton icon={<Trash2 className="h-4 w-4" />} label="Clear" onClick={onClear} />
          <EditorButton
            icon={<RotateCcw className="h-4 w-4" />}
            label="Use example"
            onClick={onUseExample}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          placeholder={`{
  "appName": "Schema Studio",
  "emoji": "✨",
  "published": true
}`}
          className="min-h-[28rem] flex-1 resize-y rounded-lg border border-slate-200 bg-slate-950 p-4 font-mono text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
        />

        <div className="flex flex-col gap-2">
          {isValid ? (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              JSON is valid and ready to generate.
            </div>
          ) : null}
          {!isValid && !isEmpty && error ? <ErrorMessage message={error} /> : null}
          {isEmpty ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              Paste JSON or load the example to begin.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

interface EditorButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

function EditorButton({ icon, label, onClick }: EditorButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-700"
    >
      {icon}
      {label}
    </button>
  );
}
