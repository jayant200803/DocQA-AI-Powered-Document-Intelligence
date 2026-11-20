import { useState } from 'react';
import { Check, Loader2, ChevronDown } from 'lucide-react';
import { PipelineStage } from '../../types';

interface Props {
  stages: PipelineStage[];
  mode: string;
  done: boolean;
  // Collapsible (persisted under an answer) starts as a one-line summary.
  collapsible?: boolean;
}

// Shows the agentic pipeline: each stage checks off as it completes, with a
// CAG/RAG badge — so it's visibly a real pipeline, not a single lookup.
export default function PipelineTrace({ stages, mode, done, collapsible = false }: Props) {
  const [open, setOpen] = useState(!collapsible);
  if (!stages.length) return null;

  const badge = mode ? (mode === 'cag' ? 'CAG · whole document' : 'Agentic RAG') : 'Pipeline';

  return (
    <div className="msg-enter max-w-[75%] rounded-lg border border-line bg-surface/70 p-3 text-xs backdrop-blur-sm">
      <button
        type="button"
        onClick={collapsible ? () => setOpen((o) => !o) : undefined}
        className={`flex w-full items-center gap-2 ${collapsible ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <span className="font-semibold uppercase tracking-widest text-faint">Pipeline</span>
        <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
          {badge}
        </span>
        {collapsible && <span className="text-faint">· {stages.length} steps</span>}
        {collapsible && (
          <ChevronDown className={`ml-auto h-3.5 w-3.5 text-faint transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </button>

      {open && (
        <ol className="mt-2.5 space-y-1.5">
          {stages.map((s, i) => {
            const active = !done && i === stages.length - 1;
            return (
              <li key={s.name + i} className="flex items-center gap-2">
                {active ? (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-accent" />
                ) : (
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                )}
                <span className={active ? 'text-ink' : 'text-muted'}>{s.label}</span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
