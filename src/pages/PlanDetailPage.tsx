import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Award,
  Camera,
  Check,
  ChevronRight,
  Leaf,
  ShoppingCart,
  Star,
} from 'lucide-react';

import CoverageChecker from '../components/CoverageChecker';
import RecommendationsWidget from '../components/RecommendationsWidget';
import SocialProof from '../components/SocialProof';
import UrgencyBanner from '../components/UrgencyBanner';
import { MastercardPdpPromo } from '../components/MastercardPromo';
import { findPlan, plans } from '../data/plans';
import { useCart } from '../context/CartContext';
import { useConfig } from '../context/ConfigContext';
import { trackEvent } from '../utils/dyEvents';
import { dySelectors } from '../config/dy-selectors';

interface PlanDetailPageProps {
  onVisualSearch?: (productImageUrl?: string) => void;
}

export default function PlanDetailPage({ onVisualSearch }: PlanDetailPageProps) {
  const { sku = '' } = useParams<{ sku: string }>();
  const plan = findPlan(sku);
  const navigate = useNavigate();
  const { addPlan } = useCart();
  const { config } = useConfig();
  const [activeImage, setActiveImage] = useState<string | undefined>(plan?.image_url);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setActiveImage(plan?.image_url);
    setAdded(false);

    // [DY INTEGRATION] Standard product-view page event so DY can update the
    // visitor's affinity profile and surface "recently viewed" / "abandoned PDP".
    if (plan) {
      trackEvent('Product View', {
        productId: plan.sku,
        sku: plan.sku,
        currency: 'EUR',
        value: plan.price,
      });
    }
  }, [plan?.sku]);

  if (!plan) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold mb-2 dark:text-slate-100">Plan not found</h1>
      <p className="text-sm text-gray-600 mb-4 dark:text-slate-400">
          We couldn't find the plan <code>{sku}</code>.
        </p>
        <Link to="/" className="btn-primary inline-flex">Back to home</Link>
      </div>
    );
  }

  const wasPrice =
    plan.discount_pct && plan.discount_pct > 0
      ? plan.price / (1 - plan.discount_pct / 100)
      : null;
  const monthlyDisplay = `${plan.price.toFixed(2).replace('.', ',')} ${config.currency}`;
  const isFiberOrMobile = plan.plan_type === 'Broadband' || plan.plan_type === 'Mobile';
  const sameGroup = plans
    .filter((p) => p.group_id === plan.group_id && p.sku !== plan.sku)
    .slice(0, 4);

  const onAdd = () => {
    addPlan(plan);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const onBuyNow = () => {
    addPlan(plan);
    navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-3 flex items-center gap-1 flex-wrap dark:text-slate-400">
        <Link to="/" className="hover:underline">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to={`/plans/${plan.category_l1.toLowerCase()}`} className="hover:underline">
          {plan.category_l1}
        </Link>
        {plan.category_l2 && (
          <>
            <ChevronRight className="w-3 h-3" />
            <span>{plan.category_l2}</span>
          </>
        )}
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 font-medium dark:text-slate-200">{plan.name}</span>
      </nav>

      <div className="grid lg:grid-cols-[1fr_420px] gap-6 lg:gap-10">
        {/* Image gallery */}
        <section>
          <div className="relative rounded-2xl overflow-hidden bg-white border border-gray-200 aspect-[4/3] dark:bg-slate-800 dark:border-slate-700">
            {activeImage && (
              <img
                src={activeImage}
                alt={plan.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            {plan.promo_badge && (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-[#ffc857] text-[#062f66]">
                {plan.promo_badge}
              </span>
            )}
            {plan.eco_aware && (
              <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-[#2dbe60] text-white inline-flex items-center gap-1">
                <Leaf className="w-3 h-3" /> Eco
              </span>
            )}
            {onVisualSearch && (
              <button
                type="button"
                onClick={() => onVisualSearch(plan.image_url)}
                className="absolute bottom-3 right-3 grid place-items-center h-10 w-10 rounded-full bg-white text-[#0a4ea8] border border-[#0a4ea8] hover:bg-[#f5faff] dark:bg-slate-700 dark:text-blue-400 dark:border-blue-500"
                title="Find similar"
                aria-label="Find similar plans"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>
          {(plan.image_url || plan.image_url_secondary) && (
            <div className="grid grid-cols-4 gap-2 mt-3">
              {[plan.image_url, plan.image_url_secondary].filter(Boolean).map((src, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setActiveImage(src)}
                  className={
                    'relative rounded-lg overflow-hidden border ' +
                    (activeImage === src ? 'border-[#0a4ea8] dark:border-blue-400' : 'border-gray-200 dark:border-slate-700')
                  }
                >
                  <img src={src} alt="" className="w-full h-20 object-cover" />
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Detail panel */}
        <section>
          <div className="text-[11px] uppercase tracking-wide text-[#0a4ea8] font-semibold">
            {plan.category_l1}
            {plan.category_l2 ? ` · ${plan.category_l2}` : ''}
          </div>
          <h1 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-[#062f66] dark:text-slate-100">
            {plan.name}
          </h1>

          <div className="mt-2 flex items-center gap-3 text-sm">
            {plan.rating && (
              <span className="inline-flex items-center gap-0.5 text-[#ffc857]">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-gray-700 font-medium dark:text-slate-300">{plan.rating}</span>
                <span className="text-gray-400 dark:text-slate-500">/ 5</span>
              </span>
            )}
            <span className="text-gray-300 dark:text-slate-600">|</span>
            <span className="text-gray-600 dark:text-slate-400">SKU: {plan.sku}</span>
          </div>

          {/* Price */}
          <div className="mt-5 flex items-end gap-3">
            <span className="text-3xl md:text-4xl font-extrabold text-[#062f66] dark:text-blue-300">
              {monthlyDisplay}
            </span>
            <span className="text-sm text-gray-500 mb-1.5 dark:text-slate-400">/ month</span>
            {wasPrice && (
              <span className="text-sm text-gray-400 line-through mb-1.5 dark:text-slate-500">
                {wasPrice.toFixed(2).replace('.', ',')} {config.currency}
              </span>
            )}
          </div>
            {plan.annual_price != null && (
            <p className="text-xs text-gray-500 mt-1 dark:text-slate-400">
              {plan.annual_price.toFixed(2).replace('.', ',')} {config.currency} / year ·{' '}
              {plan.contract_length}
            </p>
            )}

          {/* [DY INTEGRATION] Mastercard pay-and-save offer — eligible for DY
              targeting (payment-method affinity, partner campaigns). */}
          <MastercardPdpPromo price={plan.price} currency={config.currency} />

          {plan.offer_ends_at && (
            <div className="mt-4">
              <UrgencyBanner endsAt={plan.offer_ends_at} />
            </div>
          )}

          {/* Quick specs */}
          <ul className="mt-5 grid grid-cols-2 gap-2 text-sm">
            {plan.energy_source && (
              <Spec label="Energy source" value={plan.energy_source} />
            )}
            {plan.green_energy_pct && (
              <Spec label="Green origin" value={`${plan.green_energy_pct}%`} />
            )}
            {plan.speed_mbps && <Spec label="Speed" value={`${plan.speed_mbps} Mbps`} />}
            {plan.data_allowance && (
              <Spec label="Data" value={plan.data_allowance} />
            )}
            <Spec label="Customer" value={plan.customer_type} />
            <Spec label="Contract" value={plan.contract_length} />
          </ul>

          {/* Social proof */}
          {plan.households_switched_30d && (
            <div className="mt-4">
              <SocialProof count={plan.households_switched_30d} />
            </div>
          )}

          {/* Description */}
          <p className="mt-5 text-sm text-gray-700 leading-relaxed dark:text-slate-300">{plan.description}</p>

          {/* Features */}
          {plan.features.length > 0 && (
            <ul className="mt-4 space-y-1.5 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#1a8c45] mt-0.5 shrink-0" />
                  <span className="dark:text-slate-300">{f}</span>
                </li>
              ))}
            </ul>
          )}

          {/* CTA */}
          <div className="mt-6 flex flex-col sm:flex-row gap-2">
            <button type="button" onClick={onBuyNow} className="btn-primary flex-1">
              <ShoppingCart className="w-4 h-4" /> Sign up now
            </button>
            <button
              type="button"
              onClick={onAdd}
              className="btn-secondary flex-1"
              disabled={added}
            >
              {added ? <><Check className="w-4 h-4" /> Added</> : <>Add to plan</>}
            </button>
          </div>

          {/* Trust line */}
          <p className="mt-3 text-xs text-gray-500 inline-flex items-center gap-1 dark:text-slate-400">
            <Award className="w-3.5 h-3.5 text-[#0a4ea8]" />
            We handle the switch with your previous provider — no service interruption.
          </p>

          {/* Coverage checker for fiber/mobile plans */}
          {isFiberOrMobile && (
            <div className="mt-6">
              <CoverageChecker planSku={plan.sku} />
            </div>
          )}
        </section>
      </div>

      {/* Same group / variants */}
      {sameGroup.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-bold text-[#062f66] mb-3 dark:text-slate-100">Other plans in this family</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {sameGroup.map((p) => (
              <Link
                key={p.sku}
                to={p.url}
                className="rounded-xl bg-white border border-gray-200 hover:border-[#0a4ea8]/40 overflow-hidden dark:bg-slate-800 dark:border-slate-700"
              >
                <img src={p.image_url} alt={p.name} className="w-full h-28 object-cover" />
                <div className="p-3">
                  <div className="text-sm font-semibold leading-tight line-clamp-2 dark:text-slate-100">{p.name}</div>
                  <div className="mt-1 text-sm font-bold text-[#062f66] dark:text-blue-300">
                    {p.price.toFixed(2).replace('.', ',')} {config.currency}/mo
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* [DY INTEGRATION] PDP recommendations — DY Choose selector
          "PDP Recommendations" with the current SKU passed as pageData. */}
      <div className="mt-12">
        <RecommendationsWidget
          selectorName={dySelectors.product.recs}
          title="Customers also chose"
          pageType="PRODUCT"
          pageData={{ sku: plan.sku, category: plan.category_l1 }}
          fallbackPlans={plans
            .filter((p) => p.category_l1 === plan.category_l1 && p.sku !== plan.sku)
            .slice(0, 4)}
          onVisualSearch={onVisualSearch}
        />
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <li className="rounded-lg border border-gray-200 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
      <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-slate-400">{label}</div>
      <div className="text-sm font-semibold text-[#062f66] dark:text-slate-100">{value}</div>
    </li>
  );
}
