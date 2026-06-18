import { useQuery } from '@tanstack/react-query';
import { useConfig } from '../context/ConfigContext';

// [DY INTEGRATION] React Query hook that fires the NovaPower search request
// against the proxy at /api/dy-search. Builds the full DY payload from the
// live ConfigContext (sectionId, feedId, widgetId, strategy, KNN params,
// boosting, geolocation, etc.) so the in-app debug panel can tweak any
// search parameter without rebuilding.

interface UseDYSearchArgs {
  query: string;
  page: number;
  selectedFilters: { field: string; values: string[] }[];
  enabled?: boolean;
}

export function useDYSearch({ query, page, selectedFilters, enabled = true }: UseDYSearchArgs) {
  const { config, setLastRequestPayload } = useConfig();

  return useQuery({
    queryKey: ['dy-search', { query, page, selectedFilters, config }],
    enabled,
    staleTime: 30_000,
    queryFn: async () => {
      const offset = (page - 1) * config.itemsPerPage;
      const numItems = config.itemsPerPage;

      // Dynamic boosting → priorityFactors
      const dynamicFactors = config.useDynamicBoosting
        ? config.dynamicBoostingFactors.map((f, idx) => {
            const clamped = Math.max(-100, Math.min(100, Number(f.weight) || 0));
            return {
              name: `filter_${idx}`,
              rule: {
                contextTrigger: null,
                name: `filter_${idx}`,
                productsFilter: {
                  items: [],
                  query: {
                    conditions: [
                      {
                        arguments: [{ action: f.matchType, value: f.value }],
                        field: f.field,
                      },
                    ],
                  },
                  type: 'dynamic',
                },
              },
              weight: clamped,
            };
          })
        : [];

      const priorityFactors: any[] = [...dynamicFactors];

      let affinityProfile: unknown = undefined;
      if (config.useAffinityBoosting) {
        priorityFactors.push({
          name: 'USER_AFFINITIES_V2',
          weight: Math.max(-100, Math.min(100, Number(config.affinityBoostWeight) || 0)),
        });
        try {
          affinityProfile = JSON.parse(config.affinityProfileJson);
        } catch {
          affinityProfile = undefined;
        }
      }

      // Server-side filters → searchFilters (pipe-separated values per field)
      const searchFilters = selectedFilters
        .filter((f) => f.values.length)
        .map((f) => ({ field: f.field, values: f.values }));

      const search: Record<string, unknown> = {
        text: query?.trim() ? query : '*',
        pagination: { numItems, offset },
        suggestMode: config.suggestMode,
        explain_mode: config.explainMode,
        translation_enabled: config.translationEnabled,
        plp_search_mode: config.plpSearchMode,
        image_boost: config.imageBoost,
        image_knn_threshold: config.imageKnnThreshold,
        text_knn_threshold: config.textKnnThreshold,
        k: config.k,
        num_candidates: config.numCandidates,
        priorityFactors,
      };

      if (affinityProfile) (search as any).affinityProfile = affinityProfile;
      if (config.useSearchFormula && config.searchFormula) (search as any).search_formula = config.searchFormula;
      if (config.useBucketSize) (search as any).bucket_size = config.bucketSize;
      if (config.sortByEnabled) (search as any).sortBy = { order: 'asc', field: 'price' };
      if (config.useLocale) (search as any).locale = config.language;

      const payload = {
        region: config.region,
        sectionId: config.sectionId,
        data: [
          {
            fId: Number(config.feedId),
            wId: Number(config.widgetId),
            maxProducts: config.maxProducts,
            rules: [],
            filtering: [],
            strategy: config.strategy,
            searchFilters,
            search,
          },
        ],
        ctx: { lng: config.language, type: config.ctxType },
        geoLocation: { geoCode: config.geoCode, geoRegionCode: config.geoRegionCode },
        uid: config.uid,
      };

      setLastRequestPayload(payload);

      const resp = await fetch('/api/dy-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const detail = await resp.text();
        throw new Error(`DY search failed (${resp.status}): ${detail}`);
      }
      return await resp.json();
    },
  });
}
