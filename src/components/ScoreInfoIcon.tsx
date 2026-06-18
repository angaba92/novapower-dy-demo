import { Info } from 'lucide-react';
import { useState } from 'react';

// [DY INTEGRATION] Tooltip showing DY's `search_score` and `score_breakdown`
// for the current item — useful for sales engineering demos. Mirrors
// sinsay_v2/src/components/ScoreInfoIcon.tsx.

interface ScoreInfoIconProps {
  item: any;
}

interface ScorePart {
  label: string;
  value: number;
  pct: number; // 0..100
}

const COLORS = ['#0a4ea8', '#2dbe60', '#ffc857', '#cc0000', '#00b4d8', '#7be0a3', '#a78bfa', '#fb923c'];

export default function ScoreInfoIcon({ item }: ScoreInfoIconProps) {
  const [open, setOpen] = useState(false);

  const score = item?.search_score ?? item?.searchScore ?? item?.md?.search_score;
  const breakdownRaw =
    item?.score_breakdown ?? item?.scoreBreakdown ?? item?.md?.score_breakdown;

  if (score === undefined && !breakdownRaw) return null;

  const parts: ScorePart[] = parseBreakdown(breakdownRaw);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        className="grid place-items-center h-6 w-6 rounded-full bg-white/90 text-[#0a4ea8] border border-[#0a4ea8]/30 shadow-sm hover:bg-white"
        title="DY score breakdown"
        aria-label="DY score breakdown"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute z-20 right-0 top-7 w-64 frosted-glass-dark rounded-lg p-3 shadow-xl text-xs">
          <div className="flex items-center justify-between mb-2 text-white/80 uppercase tracking-wide">
            <span>DY Score</span>
            {score !== undefined && (
              <span className="font-mono text-white">{Number(score).toFixed(3)}</span>
            )}
          </div>
          {parts.length > 0 ? (
            <>
              <div className="flex gap-3 items-center">
                <PieChart parts={parts} />
                <ul className="flex-1 space-y-1">
                  {parts.map((p, i) => (
                    <li key={p.label} className="flex items-center gap-1.5">
                      <span
                        className="inline-block w-2.5 h-2.5 rounded"
                        style={{ background: COLORS[i % COLORS.length] }}
                      />
                      <span className="text-white/80 truncate">{p.label}</span>
                      <span className="ml-auto font-mono text-white">{p.pct.toFixed(0)}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <p className="text-white/70">No breakdown available.</p>
          )}
        </div>
      )}
    </div>
  );
}

function parseBreakdown(input: any): ScorePart[] {
  if (!input) return [];
  const list = Array.isArray(input) ? input : String(input).split(/[;,]/).map((s) => s.trim());
  const parts: ScorePart[] = [];
  for (const entry of list) {
    if (typeof entry === 'string') {
      // expected format: "label: value (pct%)"
      const m = entry.match(/^([^:]+):\s*([0-9.+-]+)\s*\(\s*([0-9.+-]+)\s*%\s*\)/);
      if (m) {
        parts.push({ label: m[1].trim(), value: Number(m[2]), pct: Number(m[3]) });
      }
    } else if (entry && typeof entry === 'object') {
      const label = entry.label ?? entry.name ?? 'part';
      const value = Number(entry.value ?? 0);
      const pct = Number(entry.percentage ?? entry.pct ?? 0);
      parts.push({ label, value, pct });
    }
  }
  return parts;
}

function PieChart({ parts }: { parts: ScorePart[] }) {
  const total = parts.reduce((s, p) => s + Math.max(0, p.pct), 0) || 1;
  let acc = 0;
  const radius = 24;
  const stroke = 8;
  const c = 2 * Math.PI * radius;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90 shrink-0">
      <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={stroke} />
      {parts.map((p, i) => {
        const dash = (Math.max(0, p.pct) / total) * c;
        const offset = -((acc / total) * c);
        acc += Math.max(0, p.pct);
        return (
          <circle
            key={i}
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={offset}
          />
        );
      })}
    </svg>
  );
}
