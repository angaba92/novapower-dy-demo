import { useMutation } from '@tanstack/react-query';
import { useConfig } from '../context/ConfigContext';

// [DY INTEGRATION] React Query mutation that sends a Shopping Muse / Agent
// Assistant message via /api/shopping-muse. NovaPower passes the current
// page type so the assistant has the right context (e.g. PDP for sku-aware
// suggestions, CART for upsell prompts).

export interface MuseWidget {
  title?: string;
  slots?: Array<{
    slotId?: string;
    sku?: string;
    productData?: Record<string, any>;
  }>;
}

export interface MuseResponse {
  assistant: string;
  chatId: string | null;
  support: boolean;
  widgets: MuseWidget[];
  warnings: { code?: string; message?: string }[];
  rawResponse: unknown;
}

interface MuseArgs {
  text: string;
  chatId?: string;
  pageType?: string;
  pageData?: string[];
}

export function useShoppingMuse() {
  const { config } = useConfig();

  return useMutation<MuseResponse, Error, MuseArgs>({
    mutationFn: async ({ text, chatId, pageType, pageData }) => {
      const resp = await fetch('/api/shopping-muse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          chatId,
          locale: config.language,
          pageLocation: window.location.href,
          userAgent: navigator.userAgent,
          pageType: pageType ?? config.ctxType,
          pageData,
        }),
      });
      if (!resp.ok) {
        const detail = await resp.text();
        throw new Error(`Shopping Muse failed (${resp.status}): ${detail}`);
      }
      return (await resp.json()) as MuseResponse;
    },
  });
}
