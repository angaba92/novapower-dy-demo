// Generates productfeed.csv from src/data/plans.ts
// Run with:  node scripts/generate-feed.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const plansPath = resolve(repoRoot, 'src/data/plans.ts');

// Read the TS source and use esbuild's transform via the local TS toolchain.
let src = readFileSync(plansPath, 'utf8');
src = src
  // Drop type imports
  .replace(/^import\s+type[^;]+;?\s*$/gm, '')
  .replace(/^import[^;]+from\s+['"][^'"]+['"];?\s*$/gm, '')
  // Drop top-level type annotations on exported names
  .replace(/export\s+const\s+plans\s*:\s*Plan\[\]\s*=/, 'export const plans =')
  .replace(
    /export\s+const\s+featuredCategories\s*:\s*\{[^}]*\}\[\]\s*=/,
    'export const featuredCategories =',
  )
  .replace(/export\s+const\s+heroPlans\s*=/, 'export const heroPlans =')
  // Strip TS function signatures used inside this module
  .replace(/(\(\s*slug)\s*:\s*string\s*\)/g, '$1)')
  // Drop the helper / lookup functions entirely (we only need `plans`)
  .replace(/export\s+function\s+findPlan[\s\S]*?\n\}\n/, '')
  .replace(/export\s+function\s+plansByCategory[\s\S]*?\n\}\n/, '');

// Write a temporary ESM file alongside this script and import it.
const tmpPath = resolve(__dirname, '_plans.tmp.mjs');
writeFileSync(tmpPath, src, 'utf8');
const { plans } = await import(`file://${tmpPath}?t=${Date.now()}`);

// CSV columns — DY mandatory + recommended + localized (es_ES).
const columns = [
  'sku',
  'name',
  'url',
  'price',
  'categories',
  'group_id',
  'image_url',
  'in_stock',
  // Custom merchandising columns
  'keywords',
  'annual_price',
  'discount_pct',
  'contract_length',
  'energy_source',
  'customer_type',
  'plan_type',
  'speed_mbps',
  'data_allowance',
  'green_energy_pct',
  'promo_badge',
  'rating',
  'category_l1',
  'category_l2',
  'category_l3',
  'description',
  'features',
  'image_url_secondary',
  'on_sale',
  'eco_aware',
  'households_switched_30d',
  'offer_ends_at',
  // DY localized columns (Spanish)
  'lng:es_ES:name',
  'lng:es_ES:description',
  'lng:es_ES:keywords',
];

const esLocalize = (en) => {
  if (!en) return '';
  return en
    .replace(/100% Green Electricity/gi, 'Electricidad 100% Verde')
    .replace(/Green Electricity/gi, 'Electricidad Verde')
    .replace(/Solar Self-Consumption/gi, 'Autoconsumo Solar')
    .replace(/Smart Home/gi, 'Hogar Inteligente')
    .replace(/EV Charger/gi, 'Cargador VE')
    .replace(/Fiber/gi, 'Fibra')
    .replace(/Mobile Family/gi, 'Móvil Familia')
    .replace(/Mobile/gi, 'Móvil')
    .replace(/Bundle/gi, 'Pack')
    .replace(/Plan/gi, 'Plan')
    .replace(/Renewable/gi, 'Renovable')
    .replace(/No commitment/gi, 'Sin permanencia')
    .replace(/Best Seller/gi, 'Más vendido')
    .replace(/Limited Offer/gi, 'Oferta limitada')
    .replace(/Most Popular/gi, 'Más popular')
    .replace(/Save up to 30%/gi, 'Ahorra hasta un 30%')
    .replace(/We handle the switch/gi, 'Nos encargamos del cambio')
    .replace(/Switch in 5 minutes/gi, 'Cambia en 5 minutos');
};

const escape = (raw) => {
  if (raw === undefined || raw === null) return '';
  let v = typeof raw === 'boolean' ? (raw ? 'true' : 'false') : String(raw);
  if (Array.isArray(raw)) v = raw.join('|');
  if (/[",\n\r]/.test(v)) v = `"${v.replace(/"/g, '""')}"`;
  return v;
};

const rows = [columns.join(',')];
for (const p of plans) {
  const row = columns.map((col) => {
    switch (col) {
      case 'lng:es_ES:name':
        return escape(esLocalize(p.name));
      case 'lng:es_ES:description':
        return escape(esLocalize(p.description));
      case 'lng:es_ES:keywords':
        return escape(esLocalize(p.keywords));
      case 'features':
        return escape(Array.isArray(p.features) ? p.features.join('|') : '');
      default:
        return escape(p[col]);
    }
  });
  rows.push(row.join(','));
}

const csvPath = resolve(repoRoot, 'productfeed.csv');
writeFileSync(csvPath, rows.join('\n') + '\n', 'utf8');
console.log(`Wrote ${rows.length - 1} plans to ${csvPath}`);

// Clean up tmp
try {
  const { unlinkSync } = await import('node:fs');
  unlinkSync(tmpPath);
} catch {
  // ignore
}
