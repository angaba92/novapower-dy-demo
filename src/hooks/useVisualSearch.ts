import { useMutation } from '@tanstack/react-query';
import { useConfig } from '../context/ConfigContext';

// [DY INTEGRATION] Visual Search mutation. NovaPower exposes this on the
// header (camera icon) and on every plan card for "find similar plans/devices".

export interface VisualSearchArgs {
  imageBase64?: string;
  imageUrl?: string;
  pageType?: string;
  pageData?: string[];
}

export interface VisualSearchResponse {
  results: any[];
  totalResults: number;
  rawResponse: unknown;
}

export function useVisualSearch() {
  const { config } = useConfig();

  return useMutation<VisualSearchResponse, Error, VisualSearchArgs>({
    mutationFn: async (args) => {
      const resp = await fetch('/api/visual-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...args,
          ...(config.visualSearchApiKey ? { apiKey: config.visualSearchApiKey } : {}),
        }),
      });
      if (!resp.ok) {
        const detail = await resp.text();
        throw new Error(`Visual Search failed (${resp.status}): ${detail}`);
      }
      return (await resp.json()) as VisualSearchResponse;
    },
  });
}
