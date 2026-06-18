import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

// [DY INTEGRATION] Live-tunable Dynamic Yield configuration. Mirrors the
// ConfigContext from sinsay_v2 so the same debug panel works on NovaPower.
// All NovaPower-specific defaults are tuned for the utilities/telco demo:
//   - currency: € (euro)
//   - language: en_US (with es_ES toggle)
//   - categoryPath: NovaPower / Plans
//   - logoUrl: /logo.svg

export type BoostMatchType = 'IS' | 'CONTAINS' | 'IS_NOT';

export interface DynamicBoostingFactor {
  id: string;
  field: string;
  value: string;
  matchType: BoostMatchType;
  weight: number;
}

export interface DYConfig {
  // Core API resolution
  sectionId: string;
  feedId: string;
  widgetId: string;
  region: 'US' | 'EU';

  // Search & strategy
  strategy: string;
  maxProducts: number;
  itemsPerPage: number;
  bucketSize: number;
  searchFormula: string;
  suggestMode: boolean;
  explainMode: boolean;
  translationEnabled: boolean;
  plpSearchMode: boolean;
  sortByEnabled: boolean;
  useSearchFormula: boolean;
  useBucketSize: boolean;
  useLocale: boolean;

  // KNN / semantic
  k: number;
  numCandidates: number;
  textKnnThreshold: number;
  imageKnnThreshold: number;
  imageBoost: number;

  // Localization & environment
  ctxType: string;
  language: string;
  geoCode: string;
  geoRegionCode: string;
  uid: string;
  currency: string;
  categoryPath: string;
  logoUrl: string;

  // Field priority mapping
  mapping: {
    title: string[];
    image: string[];
    url: string[];
    price: string[];
    brand: string;
  };

  // Boosting
  useDynamicBoosting: boolean;
  dynamicBoostingFactors: DynamicBoostingFactor[];
  useAffinityBoosting: boolean;
  affinityBoostWeight: number;
  affinityProfileJson: string;

  // API Keys (override .env.local at runtime)
  visualSearchApiKey: string;
}

export const defaultConfig: DYConfig = {
  // NOTE: Reused from sinsay_v2 source. Replace with your real NovaPower
  // section/feed/widget IDs from the DY console when going live.
  sectionId: '8795021',
  feedId: '85470',
  widgetId: '464618',
  region: 'EU', // utilities feed is European, so default to EU endpoint

  strategy: 'SEMANTIC_SEARCH',
  maxProducts: 1000,
  itemsPerPage: 12,
  bucketSize: 10,
  searchFormula: '',
  suggestMode: true,
  explainMode: false,
  translationEnabled: false,
  plpSearchMode: false,
  sortByEnabled: false,
  useSearchFormula: false,
  useBucketSize: false,
  useLocale: false,

  k: 100,
  numCandidates: 500,
  textKnnThreshold: 0.7,
  imageKnnThreshold: 0.8,
  imageBoost: 0.5,

  ctxType: 'HOMEPAGE',
  language: 'en_US',
  geoCode: 'ES',
  geoRegionCode: 'ES_MD',
  uid: '9190339902873124000',
  currency: '€',
  categoryPath: 'NovaPower / Plans',
  logoUrl: '/logo.svg',

  mapping: {
    title: ['name', 'productName'],
    image: ['image_url', 'image_url_small', 'imageUrl'],
    url: ['url', 'product_url'],
    price: ['price', 'dy_display_price'],
    brand: 'brand',
  },

  useDynamicBoosting: false,
  dynamicBoostingFactors: [
    { id: 'f1', field: 'categories', value: 'Green Plans', matchType: 'IS', weight: 50 },
  ],
  useAffinityBoosting: false,
  affinityBoostWeight: 80,
  affinityProfileJson: '{ "categories": { "Green Plans": 100 } }',

  visualSearchApiKey: '',
};

interface ConfigContextValue {
  config: DYConfig;
  setConfig: (next: DYConfig) => void;
  lastRequestPayload: unknown;
  setLastRequestPayload: (p: unknown) => void;
}

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

const STORAGE_KEY = 'dy_novapower_config';

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<DYConfig>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...defaultConfig, ...JSON.parse(raw) };
    } catch {
      /* ignore */
    }
    return defaultConfig;
  });
  const [lastRequestPayload, setLastRequestPayload] = useState<unknown>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      /* ignore */
    }
  }, [config]);

  return (
    <ConfigContext.Provider
      value={{
        config,
        setConfig: setConfigState,
        lastRequestPayload,
        setLastRequestPayload,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used inside <ConfigProvider>');
  return ctx;
}
