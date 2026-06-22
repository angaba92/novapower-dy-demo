/**
 * Dynamic Yield Selector Names Configuration
 *
 * Centralized config for all DY selector names used across the demo.
 * Allows full customization per deployment via environment variables.
 *
 * Environment variable format:
 * NEXT_PUBLIC_DY_SELECTOR_{PAGE}_{SLOT}=Your Custom Selector Name
 *
 * Examples:
 * NEXT_PUBLIC_DY_SELECTOR_HOMEPAGE_HERO=My Custom Hero
 * NEXT_PUBLIC_DY_SELECTOR_CATEGORY_RECS=Category Custom Recs
 * NEXT_PUBLIC_DY_SELECTOR_PRODUCT_RECS=PDP Custom Recs
 */

interface DYSelectorConfig {
  homepage: {
    hero: string;
    recs: string;
  };
  category: {
    recs: string;
    hero: string;
  };
  product: {
    recs: string;
    affinity: string;
  };
  cart: {
    recs: string;
    upsell: string;
  };
  account: {
    recs: string;
  };
  global: {
    headerMenuReorder: string;
    affinityBubble: string;
  };
}

// Default selector names (fallback)
const DEFAULTS: DYSelectorConfig = {
  homepage: {
    hero: 'NovaPower Homepage Hero',
    recs: 'NovaPower Homepage Recommendations',
  },
  category: {
    recs: 'Category Recommendations',
    hero: 'Category Hero',
  },
  product: {
    recs: 'PDP Recommendations',
    affinity: 'PDP Affinity',
  },
  cart: {
    recs: 'Cart Recommendations',
    upsell: 'Cart Upsell',
  },
  account: {
    recs: 'Account Recommendations',
  },
  global: {
    headerMenuReorder: 'Header Menu Reorder',
    affinityBubble: 'Affinity Bubble',
  },
};

// Build config with environment variable overrides
function buildConfig(): DYSelectorConfig {
  const config: DYSelectorConfig = JSON.parse(JSON.stringify(DEFAULTS));

  // Override from environment variables
  const envPrefix = 'NEXT_PUBLIC_DY_SELECTOR_';

  // Homepage
  if (process.env[`${envPrefix}HOMEPAGE_HERO`]) {
    config.homepage.hero = process.env[`${envPrefix}HOMEPAGE_HERO`]!;
  }
  if (process.env[`${envPrefix}HOMEPAGE_RECS`]) {
    config.homepage.recs = process.env[`${envPrefix}HOMEPAGE_RECS`]!;
  }

  // Category
  if (process.env[`${envPrefix}CATEGORY_RECS`]) {
    config.category.recs = process.env[`${envPrefix}CATEGORY_RECS`]!;
  }
  if (process.env[`${envPrefix}CATEGORY_HERO`]) {
    config.category.hero = process.env[`${envPrefix}CATEGORY_HERO`]!;
  }

  // Product
  if (process.env[`${envPrefix}PRODUCT_RECS`]) {
    config.product.recs = process.env[`${envPrefix}PRODUCT_RECS`]!;
  }
  if (process.env[`${envPrefix}PRODUCT_AFFINITY`]) {
    config.product.affinity = process.env[`${envPrefix}PRODUCT_AFFINITY`]!;
  }

  // Cart
  if (process.env[`${envPrefix}CART_RECS`]) {
    config.cart.recs = process.env[`${envPrefix}CART_RECS`]!;
  }
  if (process.env[`${envPrefix}CART_UPSELL`]) {
    config.cart.upsell = process.env[`${envPrefix}CART_UPSELL`]!;
  }

  // Account
  if (process.env[`${envPrefix}ACCOUNT_RECS`]) {
    config.account.recs = process.env[`${envPrefix}ACCOUNT_RECS`]!;
  }

  // Global
  if (process.env[`${envPrefix}GLOBAL_HEADER_MENU_REORDER`]) {
    config.global.headerMenuReorder = process.env[`${envPrefix}GLOBAL_HEADER_MENU_REORDER`]!;
  }
  if (process.env[`${envPrefix}GLOBAL_AFFINITY_BUBBLE`]) {
    config.global.affinityBubble = process.env[`${envPrefix}GLOBAL_AFFINITY_BUBBLE`]!;
  }

  return config;
}

export const dySelectors = buildConfig();

/**
 * Debug utility: log which selector is being requested
 * Only logs in development mode to keep production logs clean
 */
export function logDYSelectorRequest(
  page: string,
  slot: string,
  selector: string,
  context?: Record<string, unknown>,
) {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.debug(
      `[DY] Requesting selector: "${selector}" (${page}/${slot})`,
      context ? `with context:` : '',
      context || '',
    );
  }
}
