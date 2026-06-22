import { Zap } from 'lucide-react';

// [DY INTEGRATION] Dev-only corner badge that tells an SE, at a glance, whether
// a slot is currently driven by a live DY campaign ("DY") or still rendering the
// React fallback ("fallback"). Rendered only in dev builds so it never ships to
// prospects in a production deploy.
interface DYSlotBadgeProps {
  overridden: boolean;
  slot: string;
}

export default function DYSlotBadge({ overridden, slot }: DYSlotBadgeProps) {
  if (!import.meta.env.DEV) return null;

  return (
    <span
      title={`DY slot #${slot} — ${overridden ? 'overridden by a live DY campaign' : 'showing React fallback'}`}
      className={
        'absolute top-2 right-2 z-30 inline-flex items-center gap-1 rounded-full px-2 py-0.5 ' +
        'text-[9px] font-bold uppercase tracking-wider shadow-sm pointer-events-auto select-none ' +
        (overridden
          ? 'bg-emerald-500 text-white'
          : 'bg-slate-900/40 text-white/80 backdrop-blur-sm')
      }
    >
      <Zap className="w-2.5 h-2.5" aria-hidden="true" />
      {overridden ? 'DY' : 'fallback'}
    </span>
  );
}
