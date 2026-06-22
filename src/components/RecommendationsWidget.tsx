import { useEffect, useRef } from 'react';
import type { Plan } from '../types';
import PlanCard from './PlanCard';
import DYSlotBadge from './DYSlotBadge';
import { logDYSlot } from '../config/dy-slots';
import { useDYSlotOverride } from '../hooks/useDYSlotOverride';

interface RecommendationsWidgetProps {
  /**
   * DY slot DIV id that this widget exposes. Create a campaign in the DY admin
   * whose Custom Action / Recommendation Widget targets `#${slot}` to inject
   * personalized content here. Defined centrally in config/dy-slots.ts.
   */
  slot: string;
  /** Human label, used only for the dev-mode slot log. */
  label?: string;
  title: string;
  /**
   * Fallback plans rendered as the slot's default content. DY overrides this
   * DOM via its Custom Action when a matching campaign is live; until then the
   * curated fallback keeps the page populated so the demo never looks empty.
   */
  fallbackPlans: Plan[];
  onVisualSearch?: (productImageUrl?: string) => void;
}

// [DY INTEGRATION] Native client-side recommendations slot. We render an
// addressable container (`#${slot}`) that DY populates via campaigns configured
// in the admin. The curated fallback plans live inside a `[data-dy-fallback]`
// wrapper as the default content; DY's Custom Action replaces them when a
// campaign matches. A dev-only badge flags which state the slot is in.
export default function RecommendationsWidget({
  slot,
  label,
  title,
  fallbackPlans,
  onVisualSearch,
}: RecommendationsWidgetProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const overridden = useDYSlotOverride(slotRef);

  useEffect(() => {
    logDYSlot(slot, label ?? title);
  }, [slot, label, title]);

  if (fallbackPlans.length === 0) return null;

  return (
    <section className="my-10 relative" data-dy-slot={slot}>
      <div className="flex items-end justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-[#0c1b2a] dark:text-slate-100">{title}</h2>
      </div>
      {/* DY targets this DIV id; the [data-dy-fallback] child is the default render. */}
      <div id={slot} ref={slotRef}>
        <div data-dy-fallback className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {fallbackPlans.slice(0, 4).map((p, i) => (
            <PlanCard key={p.sku ?? i} plan={p} onVisualSearch={onVisualSearch} />
          ))}
        </div>
      </div>
      <DYSlotBadge overridden={overridden} slot={slot} />
    </section>
  );
}
