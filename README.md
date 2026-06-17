# NovaPower — Dynamic Yield Demo (Utilities & Telco)

NovaPower is a fictional pan-European energy + broadband + mobile retailer used as a sales-engineering demo for [Dynamic Yield (by Mastercard)](https://www.dynamicyield.com/). The site is a full-stack equivalent of the retail `sinsay_v2` demo, adapted for the **utilities / telecommunications** vertical: instead of clothing SKUs, the catalog is electricity tariffs, gas plans, fiber broadband, mobile lines, multi-utility bundles, smart-home devices and add-on services.

Every Dynamic Yield integration point from the retail original is preserved here — Search, Visual Search, Shopping Muse, recommendations, banners, context scripts and event tracking — so prospects can see how DY fits a vertical that traditionally has very different KPIs (subscription LTV, churn, switch-rate) from a traditional e-commerce shop.

---

## 1. Quick start

```bash
# 1. Install deps
npm install

# 2. (Optional) regenerate the product feed from the in-app catalog
node scripts/generate-feed.mjs

# 3. Start the dev server
npm run dev      # http://localhost:5173
```

The dev server proxies all `/api/*` calls to lightweight serverless handlers under `api/` (see `vite.config.ts`). DY API keys live in `.env.local` and are never bundled in the client.

### Environment variables

```
# .env.local — values are reused from the sinsay_v2 demo so the feed and
# section IDs are already wired.
VISUALSEARCH_API_KEY=<dy-visual-search-key>
SHOPPINGMUSE_API_KEY=<dy-agent-assistant-key>     # optional
DY_CHOOSE_API_KEY=<dy-choose-api-key>             # optional
DY_EVENT_API_KEY=<dy-event-collection-key>        # optional
```

When `DY_CHOOSE_API_KEY` / `DY_EVENT_API_KEY` are unset the `/api/dy-choose` and `/api/dy-event` endpoints fall back to deterministic mock responses — useful for offline demos.

### Useful DY config defaults

The defaults in `src/context/ConfigContext.tsx` are reused from `sinsay_v2`:

| Param        | Value     |
|--------------|-----------|
| `sectionId`  | `8787656` |
| `feedId`     | `85470`   |
| `widgetId`   | `464618`  |
| `region`     | `EU`      |
| `currency`   | `€`       |
| `geoCode`    | `ES`      |

Press **CTRL + SHIFT + K** at any time to open the in-page DY config panel and tweak any of these without rebuilding.

---

## 2. Site map

| Route               | Purpose                                          | DY contexts fired       |
|---------------------|--------------------------------------------------|-------------------------|
| `/`                 | Homepage with hero banner & two recs strips      | `HOMEPAGE`              |
| `/plans/:category`  | Category PLP (electricity, gas, broadband, …)    | `CATEGORY` (with cat)   |
| `/plan/:sku`        | PDP with coverage check + variant family         | `PRODUCT` (with sku)    |
| `/cart`             | Cart with quantity controls + bundle hint        | `CART` (with line skus) |
| `/checkout`         | Single-step checkout, fires `Purchase` on submit | `OTHER`                 |
| `/account`          | Customer dashboard (mocked active contracts)     | `OTHER`                 |
| `/search?q=…`       | DY-powered search results page with facets       | `OTHER`                 |

The whole flow lives in `src/pages/`. Routing is `react-router-dom` v6.

---

## 3. Dynamic Yield integration points

Every place DY is wired up is marked with a `// [DY INTEGRATION]` comment. Quick index:

### 3.1 Search & PLP

* **`src/hooks/useDYSearch.ts`** — builds the full DY search payload (text query, pagination, KNN params, dynamic boosting → `priorityFactors`, USER_AFFINITIES_V2, search formula, locale, geo). All values are read from the live `ConfigContext`, so the in-page debug panel can change strategy / KNN thresholds / boosting rules without rebuilding.
* **`src/utils/dyResponseAdapter.ts`** — normalizes the DY response (`response[0].slots[].item`, `response[0].facets`) into the shape the UI expects.
* **`src/pages/SearchResultsPage.tsx`** — renders results, facets, pagination. Falls back to a local catalog search when DY returns nothing.

### 3.2 Visual Search

* **`src/components/VisualSearchOverlay.tsx`** — slide-in panel. Accepts an uploaded image (drag-drop or file picker) **or** a `productImageUrl` from a PDP. Calls `/api/visual-search` which proxies to `https://dy-api.com/v2/serve/user/search`.
* **`src/utils/imageToBase64.ts`** — handles both file → base64 and remote URL → base64 (10 MB cap).
* The **Camera** icon on each `PlanCard` and the PDP image opens the panel pre-loaded with that plan's hero image.

### 3.3 Shopping Muse / Agent Assistant

* **`src/components/MuseChatOverlay.tsx`** — chat panel branded as "NovaBot". Renders all `widgets[]` returned by DY (carousels of plan cards). Starter prompts are utilities-flavored.
* **`src/hooks/useShoppingMuse.ts`** — mutation that POSTs to `/api/shopping-muse`. Accepts `chatId`, `pageType` and `pageData` so DY can scope its answers to the current product / category.
* **`api/shopping-muse.ts`** — server proxy that forwards to `https://dy-api.com/v2/serve/user/agent-assistant`.

### 3.4 Recommendations & banners

* **`src/components/HeroBanner.tsx`** + **`src/components/RecommendationsWidget.tsx`** — both use the `useDYChoose` hook (`src/hooks/useDYChoose.ts`) which posts a `selectorNames` payload to `https://dy-api.com/v2/serve/user/choose` via `/api/dy-choose`. Falls back to a deterministic local rotation when DY returns nothing.
* DY **Choose selectors** referenced by the demo:
  * `NovaPower Homepage Hero` (HeroBanner)
  * `NovaPower Homepage Recommendations` (HomePage — "Recommended for you")
  * `Trending Plans` (HomePage — "Trending across NovaPower")
  * `Category Recommendations` (CategoryPage — "You might also like")
  * `PDP Recommendations` (PlanDetailPage — "Customers also chose")
  * `Cart Recommendations` (CartPage — "Make it a complete plan")
  * `Account Recommendations` (AccountPage — "Recommended add-ons for you")

### 3.5 Context scripts

* **`index.html`** — bootstraps `window.DY` and exposes a commented-out `dynamic.js` loader for `sectionId 8787656`.
* **`src/hooks/useDYContext.ts`** — runs on every route change. Maps the SPA URL to the correct DY context type (`HOMEPAGE`, `CATEGORY`, `PRODUCT`, `CART`, `OTHER`) and updates `window.DY.recommendationContext` accordingly.
* **`src/utils/dyEvents.ts`** — `trackEvent(name, payload)` prefers `window.DY.API` when the production loader is present; otherwise it posts to `/api/dy-event` (which forwards to `https://dy-api.com/v2/collect/user/event`).

### 3.6 Event tracking

Every key e-commerce moment fires the standard DY event so audiences and KPIs are populated automatically:

| Event              | Where                              |
|--------------------|------------------------------------|
| `Product View`     | `src/pages/PlanDetailPage.tsx`     |
| `Add to Cart`      | `src/context/CartContext.tsx`      |
| `Purchase`         | `src/pages/CheckoutPage.tsx`       |
| `Coverage Check` * | `src/components/CoverageChecker.tsx` |

\* utilities-specific custom event used to power "users who checked fiber but didn't sign up" audiences.

### 3.7 Score breakdown tooltip

* **`src/components/ScoreInfoIcon.tsx`** — when DY returns `search_score` and `score_breakdown` on a slot, the card shows a small **i** badge that opens a tooltip with the per-factor pie chart. Useful in sales-engineering demos to explain *why* a plan ranked where it did.

### 3.8 In-page debug panel

* **`src/components/ConfigPanel.tsx`** — opens with **CTRL + SHIFT + K**. Lets a sales engineer change every DY parameter live: `sectionId`, `feedId`, `widgetId`, region, strategy, KNN params, dynamic boosting (priorityFactors), USER_AFFINITIES_V2 weight, affinity profile JSON, locale, geo, etc. Also includes a Request Inspector tab that shows the last payload posted to `/api/dy-search`.

---

## 4. The product feed

The DY product feed is the single source of truth in production. The demo ships an equivalent feed at the repo root:

```
productfeed.csv         # 57 plans, UTF-8, comma-separated
```

It is generated from `src/data/plans.ts` by:

```bash
node scripts/generate-feed.mjs
```

### Mandatory DY columns (top 8)

| Column        | Notes                                                                 |
|---------------|-----------------------------------------------------------------------|
| `sku`         | Unique identifier (e.g. `ELEC-GREEN-100`, `BND-DUAL-FM`).             |
| `name`        | Plan display name.                                                    |
| `url`         | Path to the PDP (`/plan/<sku>`).                                      |
| `price`       | **Monthly** price in EUR (numeric).                                   |
| `categories`  | Pipe-separated path: `Energy\|Electricity\|Green Plans`.              |
| `group_id`    | Variant family — used by DY to dedupe variants in widgets.            |
| `image_url`   | Hero image (Unsplash URLs in the demo, swap for your CDN in prod).    |
| `in_stock`    | `true` / `false` — only `true` plans surface in DY widgets.           |

### Recommended custom columns (used for affinities, targeting, merchandising)

| Column                  | Example                                       | Used for                             |
|-------------------------|-----------------------------------------------|--------------------------------------|
| `keywords`              | `renewable\|wind\|solar\|carbon-neutral`     | Search recall + affinity signals     |
| `annual_price`          | `539.0`                                       | "Save X / year" merchandising        |
| `discount_pct`          | `15`                                          | Strikethrough pricing                |
| `contract_length`       | `12 months` / `No commitment`                 | Filter facet, audiences              |
| `energy_source`         | `100% Renewable`                              | PLP/PDP badge, eco filters           |
| `customer_type`         | `Residential` / `Business` / `Both`           | Audience routing                     |
| `plan_type`             | `Electricity` / `Bundle` / `Smart Home`       | Coarse navigation                    |
| `speed_mbps`            | `600`                                         | Broadband filter / badge             |
| `data_allowance`        | `Unlimited` / `25GB`                          | Mobile filter / badge                |
| `green_energy_pct`      | `100`                                         | Eco audience                         |
| `promo_badge`           | `Best Seller` / `New` / `Limited Offer`       | Merchandising flair                  |
| `rating`                | `4.7`                                         | Sort by rating                       |
| `category_l1/l2/l3`     | Hierarchical mirror of the site nav           | DY category context                  |
| `description`           | Free text                                     | Search recall, AI Muse grounding     |
| `features`              | Pipe-separated list                           | PDP feature checklist                |
| `image_url_secondary`   | Hover-state image                             | Hover swap                           |
| `on_sale`               | `true` / `false`                              | Sale audience                        |
| `eco_aware`             | `true` / `false`                              | "Eco" widgets / audiences            |
| `households_switched_30d` | `4892`                                      | Social-proof component               |
| `offer_ends_at`         | ISO date                                      | Urgency banner                       |

### Localized columns

DY supports per-locale overrides via the `lng:<locale>:<column>` convention. The demo includes Spanish localization for the most demo-relevant fields:

| Column                  | Example                                |
|-------------------------|----------------------------------------|
| `lng:es_ES:name`        | `EcoFlex Electricidad 100% Verde`      |
| `lng:es_ES:description` | Spanish description                    |
| `lng:es_ES:keywords`    | Spanish keyword bag                    |

To add another locale (e.g. `pt_PT`, `fr_FR`), extend `esLocalize()` in `scripts/generate-feed.mjs` and add a column for that locale.

### Sync to DY

In production the feed is uploaded to DY with one of:

* SFTP drop ([docs](https://support.dynamicyield.com/hc/en-us/articles/360018537093))
* DY Feed API
* Direct e-commerce platform connector (Shopify, BigCommerce, Salesforce Commerce, etc.)

For this demo, the feed is hosted by DY at `feedId=85470` (already wired via `ConfigContext`).

---

## 5. Repository layout

```
.
├── api/                       # Vercel-style serverless proxies
│   ├── dy-search.ts           # POST → recs-search.dynamicyield.com
│   ├── dy-choose.ts           # POST → dy-api.com/v2/serve/user/choose
│   ├── dy-event.ts            # POST → dy-api.com/v2/collect/user/event
│   ├── shopping-muse.ts       # POST → dy-api.com/v2/serve/user/agent-assistant
│   └── visual-search.ts       # POST → dy-api.com/v2/serve/user/search
├── public/
├── scripts/
│   └── generate-feed.mjs      # CSV generator
├── src/
│   ├── components/            # Header, PlanCard, ConfigPanel, overlays, …
│   ├── context/               # CartContext, ConfigContext
│   ├── data/plans.ts          # Source of truth for the catalog
│   ├── hooks/                 # useDYSearch, useDYChoose, useDYContext, …
│   ├── pages/                 # Home, Category, PlanDetail, Cart, Checkout, Account, Search
│   ├── utils/                 # imageToBase64, dyEvents, dyResponseAdapter
│   ├── App.tsx                # Routes + global overlays
│   ├── main.tsx               # Provider tree
│   └── types.ts
├── productfeed.csv            # ⬅ DY-compliant feed at repo root
├── package.json
├── vite.config.ts
└── README.md                  # this file
```

---

## 6. Useful links

* DY product feed reference: <https://support.dynamicyield.com/hc/en-us/articles/360018537093>
* DY recommendations API: <https://support.dynamicyield.com/hc/en-us/articles/360008991154>
* DY Choose API: <https://support.dynamicyield.com/hc/en-us/articles/360022198354>
* DY event collection: <https://support.dynamicyield.com/hc/en-us/articles/360008991174>
* DY Visual Search: <https://support.dynamicyield.com/hc/en-us/articles/15960036693907>
* DY Shopping Muse / Agent Assistant: <https://support.dynamicyield.com/hc/en-us/articles/24569389018131>
