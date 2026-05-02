import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  label: string;
  copyLabel: string;
}

export function CodeBlock({ code, label, copyLabel }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2">
        <h2 className="text-sm font-semibold text-slate-900">{label}</h2>
        <button
          type="button"
          onClick={() => {
            void handleCopy();
          }}
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-700"
        >
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {copied ? 'Copied' : copyLabel}
        </button>
      </div>
      <pre className="max-h-[34rem] overflow-auto bg-slate-950 p-4 text-sm leading-6 text-slate-100">
        <code>{code}</code>
      </pre>
    </section>
  );
}
