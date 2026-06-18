import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Plus, ShoppingCart, Sparkles, Wifi, Smartphone, Zap, Flame, Home } from 'lucide-react';

import { findPlan } from '../data/plans';
import { useConfig } from '../context/ConfigContext';
import { useCart } from '../context/CartContext';

// "Planes conjuntos" — let visitors assemble their own bundle and watch the
// combined savings grow as they add services. Inspired by utility sites that
// reward customers for consolidating energy + telco under one bill.

interface Service {
  key: string;
  label: string;
  sku: string;
  icon: typeof Zap;
  accent: string;
}

const SERVICES: Service[] = [
  { key: 'elec', label: 'Electricity', sku: 'ELEC-GREEN-100', icon: Zap, accent: '#0a4ea8' },
  { key: 'gas', label: 'Gas', sku: 'GAS-FIXED-24', icon: Flame, accent: '#e8590c' },
  { key: 'fiber', label: 'Fiber', sku: 'FIBER-600', icon: Wifi, accent: '#00b4d8' },
  { key: 'mobile', label: 'Mobile', sku: 'MOB-CON-25', icon: Smartphone, accent: '#7048e8' },
  { key: 'smart', label: 'Smart Home', sku: 'SH-THERMO', icon: Home, accent: '#1a8c45' },
];

// Bundle discount grows with the number of services selected.
function discountFor(count: number): number {
  if (count >= 4) return 30;
  if (count === 3) return 22;
  if (count === 2) return 15;
  return 0;
}

export default function BundleBuilder() {
  const { config } = useConfig();
  const { addPlan } = useCart();
  const navigate = useNavigate();
  const [justAdded, setJustAdded] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({
    elec: true,
    fiber: true,
    mobile: false,
    gas: false,
    smart: false,
  });

  const toggle = (key: string) =>
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));

  const { gross, count } = useMemo(() => {
    let g = 0;
    let c = 0;
    for (const s of SERVICES) {
      if (selected[s.key]) {
        const plan = findPlan(s.sku);
        if (plan) {
          g += plan.price;
          c += 1;
        }
      }
    }
    return { gross: g, count: c };
  }, [selected]);

  const discountPct = discountFor(count);
  const net = gross * (1 - discountPct / 100);
  const monthlySaving = gross - net;
  const fmt = (n: number) => `${n.toFixed(2).replace('.', ',')} ${config.currency}`;

  const addBundleToCart = () => {
    for (const s of SERVICES) {
      if (selected[s.key]) {
        const plan = findPlan(s.sku);
        if (plan) addPlan(plan);
      }
    }
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2200);
  };

  return (
    <section className="my-12 rounded-2xl overflow-hidden border border-gray-200 bg-white dark:bg-slate-800 dark:border-slate-700">
      <div className="grid lg:grid-cols-[1fr_360px]">
        {/* Picker */}
        <div className="p-6 md:p-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#1a8c45]">
            <Sparkles className="w-4 h-4" /> Planes conjuntos
          </div>
          <h2 className="mt-1 text-2xl md:text-3xl font-bold text-[#062f66] dark:text-slate-100">
            Build your bundle, watch the savings grow
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
            Combine energy, broadband, mobile and smart home on one bill. The more you add, the
            more you save — up to 30%.
          </p>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SERVICES.map((s) => {
              const plan = findPlan(s.sku);
              const on = selected[s.key];
              const Icon = s.icon;
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => toggle(s.key)}
                  aria-pressed={on}
                  className={
                    'relative flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition ' +
                    (on
                      ? 'border-[#0a4ea8] bg-[#f5faff] ring-1 ring-[#0a4ea8]/30 dark:bg-slate-700 dark:border-blue-500'
                      : 'border-gray-200 hover:border-[#0a4ea8]/40 dark:border-slate-600 dark:hover:border-slate-500')
                  }
                >
                  <span
                    className="grid place-items-center w-9 h-9 rounded-lg text-white"
                    style={{ backgroundColor: s.accent }}
                  >
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="text-sm font-semibold text-[#062f66] dark:text-slate-100">{s.label}</span>
                  {plan && (
                    <span className="text-[11px] text-gray-500 dark:text-slate-400">
                      from {fmt(plan.price)}/mo
                    </span>
                  )}
                  {on && (
                    <span className="absolute top-2 right-2 grid place-items-center w-5 h-5 rounded-full bg-[#0a4ea8] text-white">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-br from-[#062f66] to-[#0a4ea8] text-white p-6 md:p-8 flex flex-col">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/80">Your bundle</h3>
          <div className="mt-4 flex items-end gap-2">
            <span className="text-4xl font-extrabold">{count > 0 ? fmt(net) : '—'}</span>
            <span className="text-sm text-white/70 mb-1.5">/ month</span>
          </div>
          {discountPct > 0 ? (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-white/60 line-through">{fmt(gross)}</span>
              <span className="inline-flex items-center rounded-full bg-[#ffc857] px-2 py-0.5 text-[11px] font-bold text-[#062f66]">
                −{discountPct}% bundle
              </span>
            </div>
          ) : (
            <p className="mt-2 text-sm text-white/70">Add 2+ services to unlock bundle savings.</p>
          )}

          <dl className="mt-5 space-y-2 text-sm border-t border-white/15 pt-4">
            <div className="flex justify-between">
              <dt className="text-white/70">Services</dt>
              <dd className="font-semibold">{count}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/70">You save / year</dt>
              <dd className="font-semibold text-[#7be0a3]">{fmt(monthlySaving * 12)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/70">Setup fees</dt>
              <dd className="font-semibold text-[#7be0a3]">FREE</dd>
            </div>
          </dl>

          <button
            type="button"
            disabled={count === 0}
            onClick={addBundleToCart}
            className={
              'mt-auto w-full rounded-lg px-5 py-3 text-sm font-bold transition disabled:opacity-50 disabled:pointer-events-none ' +
              (justAdded
                ? 'bg-[#2dbe60] text-white'
                : 'bg-[#ffc857] text-[#062f66] hover:bg-[#ffd47a]')
            }
          >
            {justAdded ? (
              <span className="inline-flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" /> Added to cart
              </span>
            ) : (
              <span className="inline-flex items-center justify-center gap-1.5">
                <ShoppingCart className="w-4 h-4" /> Add bundle to cart
                {count > 0 && <span className="opacity-80">· {fmt(net)}/mo</span>}
              </span>
            )}
          </button>
          {justAdded ? (
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="mt-2 w-full inline-flex items-center justify-center gap-1 rounded-lg border border-white/30 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              View cart <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={count === 0}
              onClick={() => navigate('/plans/bundles')}
              className="mt-2 w-full inline-flex items-center justify-center gap-1 rounded-lg border border-white/30 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10 transition disabled:opacity-50 disabled:pointer-events-none"
            >
              <Plus className="w-4 h-4" /> Explore matching bundles
            </button>
          )}
          <p className="mt-2 text-[11px] text-white/60 text-center">
            Pay with Mastercard for an extra 10% off your first 3 months.
          </p>
        </div>
      </div>
    </section>
  );
}
