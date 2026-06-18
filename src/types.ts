// Shared NovaPower types. Mirrors the subset of fields exposed by the
// product feed (productfeed.csv) — the same fields the DY API returns when
// querying the NovaPower section.

export type CategoryL1 =
  | 'Electricity'
  | 'Gas'
  | 'Broadband'
  | 'Mobile'
  | 'Bundles'
  | 'Smart Home'
  | 'Add-ons'
  | 'Insurance';

export interface Plan {
  // Mandatory DY feed columns
  sku: string;
  name: string;
  url: string;
  price: number;            // monthly price (EUR)
  categories: string;       // pipe-separated, e.g. "Energy|Electricity|Green Plans"
  group_id: string;
  image_url: string;
  in_stock: boolean;

  // Custom DY columns (recommended for affinities, targeting, merchandising)
  keywords: string;
  annual_price?: number;
  discount_pct?: number;
  contract_length: string;
  energy_source?: string;
  customer_type: 'Residential' | 'Business' | 'Both';
  plan_type:
    | 'Electricity'
    | 'Gas'
    | 'Broadband'
    | 'Mobile'
    | 'Bundle'
    | 'Smart Home'
    | 'Add-on'
    | 'Insurance';
  speed_mbps?: string;
  data_allowance?: string;
  green_energy_pct?: string;
  promo_badge?: 'Best Seller' | 'New' | 'Limited Offer' | 'Eco' | 'Most Popular' | 'Bundle & Save' | '';
  rating?: string;

  // Hierarchy levels (mirrors site nav)
  category_l1: CategoryL1;
  category_l2?: string;
  category_l3?: string;

  // Localization (only English in mock; Spanish lives in the CSV)
  description: string;
  features: string[];

  // Display extras
  image_url_secondary?: string;
  on_sale?: boolean;
  eco_aware?: boolean;
  households_switched_30d?: number;   // social proof: "X households switched this month"
  offer_ends_at?: string;             // urgency: "Offer ends in N days"
}

export interface PlanFacet {
  field: string;
  displayName: string;
  values: { value: string; count: number }[];
  type?: 'string' | 'number';
  min?: number;
  max?: number;
}
