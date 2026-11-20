import { Check, Loader2 } from 'lucide-react';
import { PipelineStage } from '../../types';

// Shows the agentic pipeline running live: each stage checks off as it completes,
// with a CAG/RAG badge — so it's visibly a real pipeline, not a single lookup.
export default function PipelineTrace({ stages, mode, done }: { stages: PipelineStage[]; mode: string; done: boolean }) {
  if (!stages.length) return null;
  return (
    <div className="msg-enter max-w-[75%] rounded-lg border border-line bg-surface/70 p-3 text-xs backdrop-blur-sm">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="font-semibold uppercase tracking-widest text-faint">Pipeline</span>
        {mode && (
          <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
            {mode === 'cag' ? 'CAG · whole document' : 'Agentic RAG'}
          </span>
        )}
      </div>
      <ol className="space-y-1.5">
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
    </div>
  );
}
