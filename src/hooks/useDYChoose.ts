import { useQuery } from '@tanstack/react-query';
import { useConfig } from '../context/ConfigContext';

// [DY INTEGRATION] Hook for DY "Choose" — runs experiences and recommendations
// for the named selectors. Used by NovaPower for:
//   - HomePage hero personalization
//   - "Recommended plans for you" widget
//   - "Bundle and save" cross-sell on PDP
//   - "Frequently added together" on Cart

interface UseDYChooseArgs {
  selectorNames: string[];
  pageType?: string;
  pageData?: string[] | Record<string, unknown>;
  enabled?: boolean;
}

export function useDYChoose({ selectorNames, pageType, pageData, enabled = true }: UseDYChooseArgs) {
  const { config } = useConfig();

  return useQuery({
    queryKey: ['dy-choose', { selectorNames, pageType, pageData }],
    enabled,
    staleTime: 60_000,
    queryFn: async () => {
      const resp = await fetch('/api/dy-choose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectorNames,
          pageType: pageType ?? config.ctxType,
          pageData: pageData ?? [],
          pageLocation: window.location.href,
          locale: config.language,
          userAgent: navigator.userAgent,
        }),
      });
      if (!resp.ok) throw new Error(`DY Choose failed: ${resp.status}`);
      return await resp.json();
    },
  });
}
