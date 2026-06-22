/**
 * Dynamic Yield — Slot & Section configuration (client-side native flow)
 *
 * In the native DY integration, the browser loads DY's loader scripts
 * (api_dynamic.js + api_static.js) for a given SECTION. DY then evaluates
 * campaigns against `window.DY.recommendationContext` and injects content into
 * the slot DIVs below via Custom Actions / Recommendation Widgets configured in
 * the DY admin — no per-demo code changes required.
 *
 * SE workflow:
 *   1. Point the demo at any DY account by setting VITE_DY_SECTION_ID.
 *   2. In the DY admin, create campaigns whose Custom Action targets the slot
 *      DIV id (e.g. `#dy-slot-pdp-recs`).
 *   3. (Optional) Rename slot ids per deployment via VITE_DY_SLOT_* overrides.
 *
 * NOTE ON ENV VARS: this is a Vite app, so only `VITE_`-prefixed variables are
 * exposed to the browser (via `import.meta.env`). The legacy `NEXT_PUBLIC_*`
 * names documented earlier never actually reached client code under Vite.
 */

const env = import.meta.env as Record<string, string | undefined>;

/** DY Section ID — selects which DY account/section the loader scripts target. */
export const DY_SECTION_ID = env.VITE_DY_SECTION_ID || '8795021';

export interface DYSlotConfig {
  homepageHero: string;
  homepageRecs: string;
  homepageTrending: string;
  categoryRecs: string;
  pdpRecs: string;
  cartRecs: string;
  accountRecs: string;
}

export const dySlots: DYSlotConfig = {
  homepageHero: env.VITE_DY_SLOT_HOMEPAGE_HERO || 'dy-slot-homepage-hero',
  homepageRecs: env.VITE_DY_SLOT_HOMEPAGE_RECS || 'dy-slot-homepage-recs',
  homepageTrending: env.VITE_DY_SLOT_HOMEPAGE_TRENDING || 'dy-slot-homepage-trending',
  categoryRecs: env.VITE_DY_SLOT_CATEGORY_RECS || 'dy-slot-category-recs',
  pdpRecs: env.VITE_DY_SLOT_PDP_RECS || 'dy-slot-pdp-recs',
  cartRecs: env.VITE_DY_SLOT_CART_RECS || 'dy-slot-cart-recs',
  accountRecs: env.VITE_DY_SLOT_ACCOUNT_RECS || 'dy-slot-account-recs',
};

/** Dev-only log so SEs can see which slot a component is mounting. */
export function logDYSlot(slotId: string, label: string) {
  if (import.meta.env.DEV) {
    console.debug(`[DY] Slot mounted: #${slotId} (${label})`);
  }
}
