/// <reference types="vite/client" />

// [DY INTEGRATION] Typed client env vars exposed by Vite (must be VITE_-prefixed).
interface ImportMetaEnv {
  /** DY Section ID the loader scripts target. Lets SEs point at any DY account. */
  readonly VITE_DY_SECTION_ID?: string;
  // Optional per-deployment slot DIV id overrides.
  readonly VITE_DY_SLOT_HOMEPAGE_HERO?: string;
  readonly VITE_DY_SLOT_HOMEPAGE_RECS?: string;
  readonly VITE_DY_SLOT_HOMEPAGE_TRENDING?: string;
  readonly VITE_DY_SLOT_CATEGORY_RECS?: string;
  readonly VITE_DY_SLOT_PDP_RECS?: string;
  readonly VITE_DY_SLOT_CART_RECS?: string;
  readonly VITE_DY_SLOT_ACCOUNT_RECS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
