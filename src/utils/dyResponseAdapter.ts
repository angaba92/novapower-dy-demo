// [DY INTEGRATION] Normalizes the Dynamic Yield search response into the
// shape the NovaPower UI expects. Identical to sinsay_v2 — DY's response
// shape is independent of vertical, so this util ports unchanged.

interface DyFacetValue {
  value: string;
  count?: number;
}

export interface NormalizedFacet {
  field: string;
  displayName: string;
  type: 'string' | 'number';
  values: DyFacetValue[];
  min?: number;
  max?: number;
}

export interface NormalizedDyPayload {
  items: any[];
  facets: NormalizedFacet[];
  totalNumResults: number;
  rawEntry: any;
}

export function extractDyPayload(response: any): NormalizedDyPayload {
  const empty: NormalizedDyPayload = {
    items: [],
    facets: [],
    totalNumResults: 0,
    rawEntry: null,
  };
  if (!response) return empty;

  const entry = Array.isArray(response.response) ? response.response[0] : response;
  if (!entry) return empty;

  const items = Array.isArray(entry.slots)
    ? entry.slots.map((s: any) => s.item ?? s.productData ?? s).filter(Boolean)
    : [];

  const facets = normalizeFacets(entry.facets);
  const totalNumResults =
    typeof entry.totalNumResults === 'number'
      ? entry.totalNumResults
      : items.length;

  return { items, facets, totalNumResults, rawEntry: entry };
}

function normalizeFacets(facets: any): NormalizedFacet[] {
  if (!facets) return [];

  // Array shape: [{ column, displayName, values | options, valuesType, min, max }]
  if (Array.isArray(facets)) {
    return facets.map((f: any) => {
      const values = Array.isArray(f.values)
        ? f.values
        : Array.isArray(f.options)
          ? f.options
          : [];
      const isNumber =
        f.valuesType === 'number' ||
        typeof f.min === 'number' ||
        typeof f.max === 'number';
      return {
        field: f.column ?? f.field ?? '',
        displayName: f.displayName ?? f.column ?? f.field ?? '',
        type: isNumber ? 'number' : 'string',
        values: values.map((v: any) => ({
          value: String(v.value ?? v),
          count: typeof v.count === 'number' ? v.count : undefined,
        })),
        min: typeof f.min === 'number' ? f.min : undefined,
        max: typeof f.max === 'number' ? f.max : undefined,
      };
    });
  }

  // Object shape: { [key]: [{value, count}] }
  if (typeof facets === 'object') {
    return Object.entries(facets).map(([key, values]) => ({
      field: key,
      displayName: key,
      type: 'string' as const,
      values: Array.isArray(values)
        ? values.map((v: any) => ({
            value: String(v.value ?? v),
            count: typeof v.count === 'number' ? v.count : undefined,
          }))
        : [],
    }));
  }

  return [];
}
