import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Search as SearchIcon, SlidersHorizontal } from 'lucide-react';

import PlanCard from '../components/PlanCard';
import { useDYSearch } from '../hooks/useDYSearch';
import { extractDyPayload, type NormalizedFacet } from '../utils/dyResponseAdapter';
import { plans } from '../data/plans';
import type { Plan } from '../types';

interface SearchResultsPageProps {
  onVisualSearch?: (productImageUrl?: string) => void;
}

interface SelectedFilter {
  field: string;
  values: string[];
}

export default function SearchResultsPage({ onVisualSearch }: SearchResultsPageProps) {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const [page, setPage] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilter[]>([]);

  // Reset filters/page when the query changes.
  useEffect(() => {
    setPage(1);
    setSelectedFilters([]);
  }, [query]);

  // [DY INTEGRATION] Live DY search call — payload built from ConfigContext.
  const search = useDYSearch({
    query,
    page,
    selectedFilters,
    enabled: query.trim().length > 0,
  });

  const payload = extractDyPayload(search.data);
  const dyItems = payload.items;
  const facets = payload.facets;

  // Local fallback when DY returned no items or hasn't been queried yet.
  const localResults: Plan[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return plans.filter((p) => {
      const haystack = [
        p.name,
        p.description,
        p.category_l1,
        p.category_l2,
        p.keywords,
        p.energy_source,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query]);

  const items = dyItems.length > 0 ? dyItems : localResults;
  const usingFallback = dyItems.length === 0;
  const totalResults = dyItems.length > 0 ? payload.totalNumResults : localResults.length;

  const onToggleFilter = (field: string, value: string) => {
    setPage(1);
    setSelectedFilters((prev) => {
      const existing = prev.find((f) => f.field === field);
      if (!existing) return [...prev, { field, values: [value] }];
      const has = existing.values.includes(value);
      const nextValues = has
        ? existing.values.filter((v) => v !== value)
        : [...existing.values, value];
      const next = prev.filter((f) => f.field !== field);
      if (nextValues.length) next.push({ field, values: nextValues });
      return next;
    });
  };

  const isSelected = (field: string, value: string) =>
    Boolean(selectedFilters.find((f) => f.field === field)?.values.includes(value));

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const q = String(data.get('q') ?? '').trim();
    setParams(q ? { q } : {});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      <header className="mb-5">
        <p className="text-xs uppercase tracking-wide text-[#0a4ea8] font-semibold">
          Search results
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-[#062f66] dark:text-slate-100">
          {query ? <>Results for "{query}"</> : 'Search NovaPower'}
        </h1>
      </header>

      <form onSubmit={onSubmit} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            <input
              key={query}
              defaultValue={query}
              name="q"
              placeholder="Search plans, devices, FAQs…"
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#0a4ea8]/30 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>
          <button type="submit" className="btn-primary px-5">Search</button>
        </div>
      </form>

      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        {/* Facets */}
        <aside className="hidden lg:block">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:bg-slate-800 dark:border-slate-700">
            <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3 inline-flex items-center gap-1 dark:text-slate-400">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Refine
            </h2>
            {facets.length === 0 && (
              <p className="text-xs text-gray-500 dark:text-slate-400">No facets available — run a search.</p>
            )}
            <div className="space-y-4">
              {facets.map((facet) => (
                <FacetGroup
                  key={facet.field}
                  facet={facet}
                  isSelected={isSelected}
                  onToggle={onToggleFilter}
                />
              ))}
            </div>
          </div>
        </aside>

        {/* Results */}
        <section>
          <div className="flex items-center justify-between mb-3 text-sm text-gray-600 dark:text-slate-400">
            {search.isFetching ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="w-4 h-4 animate-spin" />
                Searching…
              </span>
            ) : (
              <span>
                <strong className="text-[#062f66] dark:text-slate-100">{totalResults}</strong>{' '}
                {totalResults === 1 ? 'result' : 'results'}
                {usingFallback && query && (
                  <span className="ml-2 text-xs text-gray-400 dark:text-slate-500">(local catalog)</span>
                )}
              </span>
            )}
            {search.isError && (
              <span className="text-xs text-[#cc0000]">
                {(search.error as Error)?.message || 'Search failed'}
              </span>
            )}
          </div>

          {!query && (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center dark:bg-slate-800 dark:border-slate-700">
              <SearchIcon className="w-10 h-10 text-gray-300 mx-auto dark:text-slate-600" />
              <p className="mt-3 text-sm text-gray-600 dark:text-slate-400">
                Try searching for "fiber 1 Gb", "EV charger", or "green electricity".
              </p>
            </div>
          )}

          {query && items.length === 0 && !search.isFetching && (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center dark:bg-slate-800 dark:border-slate-700">
              <p className="text-sm text-gray-600 dark:text-slate-400">
                No matches for "{query}". Try a broader keyword.
              </p>
            </div>
          )}

          {items.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map((item: any, i: number) => (
                <PlanCard
                  key={item.sku ?? item.productData?.sku ?? i}
                  plan={item.productData ?? item}
                  onVisualSearch={onVisualSearch}
                  fromDY={!usingFallback}
                />
              ))}
            </div>
          )}

          {/* Pagination — hidden when using local fallback */}
          {!usingFallback && totalResults > 24 && (
            <div className="flex justify-center gap-2 mt-8">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-xs"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500 px-3 self-center dark:text-slate-400">Page {page}</span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={items.length < 24}
                className="btn-secondary text-xs"
              >
                Next
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function FacetGroup({
  facet,
  isSelected,
  onToggle,
}: {
  facet: NormalizedFacet;
  isSelected: (field: string, value: string) => boolean;
  onToggle: (field: string, value: string) => void;
}) {
  if (facet.values.length === 0) return null;
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wide text-[#062f66] font-semibold mb-2 dark:text-slate-100">
        {facet.displayName}
      </h3>
      <div className="space-y-1 max-h-56 overflow-y-auto custom-scrollbar pr-1">
        {facet.values.slice(0, 30).map((v) => (
          <label
            key={v.value}
            className="flex items-center gap-2 text-sm cursor-pointer text-gray-700 hover:text-[#062f66] dark:text-slate-300 dark:hover:text-slate-100"
          >
            <input
              type="checkbox"
              checked={isSelected(facet.field, v.value)}
              onChange={() => onToggle(facet.field, v.value)}
            />
            <span className="flex-1 truncate">{v.value}</span>
            {typeof v.count === 'number' && (
              <span className="text-[11px] text-gray-400 dark:text-slate-500">{v.count}</span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
