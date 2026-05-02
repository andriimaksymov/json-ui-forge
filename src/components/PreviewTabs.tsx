import type { LucideIcon } from 'lucide-react';
import { Braces, Code2, FileCode2, ListChecks, Table2 } from 'lucide-react';
import type { ReactNode } from 'react';

export type PreviewTabId = 'form' | 'table' | 'typescript' | 'react' | 'json';

interface TabItem {
  id: PreviewTabId;
  label: string;
  icon: LucideIcon;
}

interface PreviewTabsProps {
  activeTab: PreviewTabId;
  onChange: (tab: PreviewTabId) => void;
  children: ReactNode;
}

const tabs: TabItem[] = [
  { id: 'form', label: 'Form', icon: ListChecks },
  { id: 'table', label: 'Table', icon: Table2 },
  { id: 'typescript', label: 'TypeScript', icon: FileCode2 },
  { id: 'react', label: 'React Code', icon: Code2 },
  { id: 'json', label: 'JSON Output', icon: Braces },
];

export function PreviewTabs({ activeTab, onChange, children }: PreviewTabsProps) {
  return (
    <section className="min-h-[calc(100vh-9rem)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-panel">
      <div className="border-b border-slate-200 bg-slate-50/80 px-3 pt-3">
        <div className="flex gap-1 overflow-x-auto pb-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white text-teal-700 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}
