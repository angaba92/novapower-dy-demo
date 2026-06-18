import { Camera, Leaf, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

import type { Plan } from '../types';
import { useCart } from '../context/CartContext';
import { useConfig } from '../context/ConfigContext';
import ScoreInfoIcon from './ScoreInfoIcon';

interface PlanCardProps {
  plan: Plan & Record<string, any>;
  onVisualSearch?: (productImageUrl?: string) => void;
  /** Set true on widgets that come from a DY recommendations endpoint so the
   *  card shows a small "Recommended by DY" tag. */
  fromDY?: boolean;
}

// Mirrors src/components/ProductCard.tsx from sinsay_v2 but for NovaPower plans.
// Key differences from the retail version:
//   - "Add to Plan" instead of "Add to Cart"
//   - shows monthly price + "/mo" + currency
//   - shows energy_source, speed_mbps or data_allowance instead of size/color
//   - "X households switched this month" social proof (utilities-specific)
//   - eco_aware → green leaf badge; promo_badge → custom merchandising badge
export default function PlanCard({ plan, onVisualSearch, fromDY }: PlanCardProps) {
  const { addPlan } = useCart();
  const { config } = useConfig();

  const title = plan.name ?? plan.productName ?? 'Plan';
  const price = typeof plan.price === 'number' ? plan.price : Number(plan.price ?? 0);
  const image = plan.image_url || plan.image_url_small || plan.imageUrl || '';
  const imageHover = plan.image_url_secondary;

  const monthlyDisplay = `${price.toFixed(2).replace('.', ',')} ${config.currency}/mo`;
  const wasPrice =
    plan.discount_pct && plan.discount_pct > 0
      ? `${(price / (1 - plan.discount_pct / 100)).toFixed(2).replace('.', ',')} ${config.currency}`
      : null;

  return (
    <article className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 transition hover:shadow-lg hover:border-[#0a4ea8]/30 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-blue-500/40">
      {/* Image */}
      <Link to={plan.url || `/plan/${plan.sku}`} className="block relative aspect-[4/3] bg-[#f5faff] overflow-hidden dark:bg-slate-700">
        {image && (
          <>
            <img
              src={image}
              alt={title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
            />
            {imageHover && (
              <img
                src={imageHover}
                alt=""
                aria-hidden
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            )}
          </>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {plan.promo_badge && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#ffc857] text-[#062f66]">
              {plan.promo_badge}
            </span>
          )}
          {plan.on_sale && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#cc0000] text-white">
              Sale
            </span>
          )}
          {plan.eco_aware && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#2dbe60] text-white inline-flex items-center gap-1">
              <Leaf className="w-3 h-3" />
              Eco
            </span>
          )}
          {fromDY && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#0a4ea8] text-white inline-flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Recommended
            </span>
          )}
        </div>

        {/* DY score tooltip — shown only when DY returned a search_score */}
        <div className="absolute top-2 right-2">
          <ScoreInfoIcon item={plan} />
        </div>

        {/* Hover actions */}
        <div className="absolute inset-x-0 bottom-0 p-3 flex gap-2 opacity-0 group-hover:opacity-100 transition translate-y-2 group-hover:translate-y-0">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              addPlan(plan);
            }}
            className={clsx('btn-primary flex-1 text-xs py-2', !plan.in_stock && 'opacity-50 pointer-events-none')}
          >
            Add to Plan
          </button>
          {onVisualSearch && image && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onVisualSearch(image);
              }}
              className="grid place-items-center h-9 w-9 rounded-lg bg-white text-[#0a4ea8] border border-[#0a4ea8] hover:bg-[#f5faff] dark:bg-slate-700 dark:text-blue-400 dark:border-blue-500"
              title="Find similar"
              aria-label="Find similar plans"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}
        </div>
      </Link>

      {/* Body */}
      <Link to={plan.url || `/plan/${plan.sku}`} className="block px-4 py-3">
        <div className="flex items-center justify-between text-[11px] text-gray-500 uppercase tracking-wide dark:text-slate-400">
          <span>{plan.category_l1 || plan.plan_type || ''}</span>
          {plan.rating && (
            <span className="inline-flex items-center gap-0.5 text-[#ffc857]">
              <Star className="w-3 h-3 fill-current" /> <span className="text-gray-700 dark:text-slate-300">{plan.rating}</span>
            </span>
          )}
        </div>
        <h3 className="mt-1 text-sm font-semibold text-[#0c1b2a] line-clamp-2 min-h-[2.6em] dark:text-slate-100">{title}</h3>

        {/* Plan-specific feature row */}
        <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
          {plan.energy_source && (
            <span className="px-1.5 py-0.5 bg-[#e9f7ed] text-[#1a8c45] rounded dark:bg-emerald-900/40 dark:text-emerald-400">{plan.energy_source}</span>
          )}
          {plan.speed_mbps && (
            <span className="px-1.5 py-0.5 bg-[#e9f2ff] text-[#0a4ea8] rounded dark:bg-blue-900/40 dark:text-blue-400">{plan.speed_mbps} Mb</span>
          )}
          {plan.data_allowance && (
            <span className="px-1.5 py-0.5 bg-[#fff5d6] text-[#a37200] rounded dark:bg-amber-900/40 dark:text-amber-400">{plan.data_allowance}</span>
          )}
          {plan.contract_length && plan.contract_length !== 'No commitment' && (
            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded dark:bg-slate-700 dark:text-slate-300">{plan.contract_length}</span>
          )}
          {plan.contract_length === 'No commitment' && (
            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded dark:bg-slate-700 dark:text-slate-300">No commitment</span>
          )}
        </div>

        {/* Price + social proof */}
        <div className="mt-2 flex items-end justify-between">
          <div>
            <div className="font-bold text-[#062f66] dark:text-blue-300">{monthlyDisplay}</div>
            {wasPrice && (
              <div className="text-xs text-gray-400 line-through dark:text-slate-500">{wasPrice}</div>
            )}
          </div>
          {plan.households_switched_30d && (
            <div className="text-[10px] text-gray-500 text-right leading-tight dark:text-slate-400">
              <strong className="text-[#1a8c45]">
                {plan.households_switched_30d.toLocaleString('en-US')}
              </strong>
              <br />
              switched / 30d
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
