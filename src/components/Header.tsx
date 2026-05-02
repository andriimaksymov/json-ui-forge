import { Braces, Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-white/86 px-4 py-5 backdrop-blur md:px-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm">
          <Braces className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-slate-950">JSON → UI</h1>
          <p className="text-sm text-slate-600">Turn JSON into forms, tables, and React code</p>
        </div>
      </div>
      <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
        <Sparkles className="h-4 w-4 text-teal-600" aria-hidden="true" />
        Local-first developer tool
      </div>
    </header>
  );
}
