import type { Plan } from '../types';
import PlanCard from './PlanCard';
import { useDYChoose } from '../hooks/useDYChoose';

interface RecommendationsWidgetProps {
  /** DY selector names to fetch — match the selectors created in the DY console. */
  selectorName: string;
  title: string;
  /** Page-type sent to DY so the widget can be context-aware. */
  pageType?: string;
  pageData?: string[] | Record<string, unknown>;
  /** Fallback plans rendered when DY returns no results (or has no key). */
  fallbackPlans: Plan[];
  onVisualSearch?: (productImageUrl?: string) => void;
}

// [DY INTEGRATION] Recommendations widget. Hits /api/dy-choose with the
// supplied selectorName (e.g. "Recommended Plans for You", "Bundle and Save",
// "Frequently Added Together"). When DY returns no live data — common in the
// demo without a populated section — we render a fallback strip of curated
// plans so the page never looks empty.
export default function RecommendationsWidget({
  selectorName,
  title,
  pageType,
  pageData,
  fallbackPlans,
  onVisualSearch,
}: RecommendationsWidgetProps) {
  const { data, isLoading } = useDYChoose({
    selectorNames: [selectorName],
    pageType,
    pageData,
  });

  const dySlots = extractSlots(data);
  const useDY = dySlots.length > 0;
  const plans = useDY ? (dySlots as Plan[]) : fallbackPlans;

  if (plans.length === 0) return null;

  return (
    <section className="my-10">
      <div className="flex items-end justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-[#0c1b2a] dark:text-slate-100">{title}</h2>
        {useDY && (
          <span className="text-[10px] uppercase tracking-wider text-[#0a4ea8] bg-[#e9f2ff] px-2 py-0.5 rounded dark:bg-blue-900/30 dark:text-blue-300">
            Personalized by Dynamic Yield
          </span>
        )}
        {isLoading && (
          <span className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400">Loading…</span>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {plans.slice(0, 4).map((p, i) => (
          <PlanCard key={(p as any).sku ?? i} plan={p as any} onVisualSearch={onVisualSearch} fromDY={useDY} />
        ))}
      </div>
    </section>
  );
}

function extractSlots(data: any): any[] {
  try {
    const payload = data?.choices?.[0]?.variations?.[0]?.payload?.data;
    if (!payload || payload.fallback) return [];
    if (Array.isArray(payload.slots)) {
      return payload.slots
        .map((s: any) => (s.item ? s.item : s.productData ? { ...s.productData, sku: s.sku } : s))
        .filter(Boolean);
    }
    return [];
  } catch {
    return [];
  }
}
