import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Check, FileText, Home, Leaf, LogOut, Plus, Settings2, Sparkles, TrendingUp, Zap } from 'lucide-react';

import RecommendationsWidget from '../components/RecommendationsWidget';
import PrivateAreaLogin from '../components/PrivateAreaLogin';
import { useConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { findPlan, plans } from '../data/plans';
import type { Plan } from '../types';

// Mocked "current contracts" so the account view feels real even with empty cart.
const MOCK_CURRENT_CONTRACTS = ['BND-DUAL-EG', 'MOB-CON-25'];
const MOCK_RECENT_VIEWED = ['ELEC-GREEN-100', 'FIBER-1G', 'SH-EV-22KW', 'BND-TRIPLE'];

// Curated upsell offers with a human reason — easy one-tap add to cart.
const UPSELL: { sku: string; reason: string }[] = [
  { sku: 'FIBER-1G', reason: 'Add gigabit fiber to your energy plan and unlock bundle savings.' },
  { sku: 'SH-THERMO', reason: 'Cut up to 12% off heating — pays for itself in a season.' },
  { sku: 'INS-TECH-PHONE', reason: 'Protect your phone from €4,99/mo against theft & damage.' },
  { sku: 'SH-EV-7K', reason: 'Charge your EV at home overnight for a fraction of public prices.' },
];

export default function AccountPage() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <PrivateAreaLogin />;
  }

  return <AccountDashboard userName={user?.name ?? 'there'} onLogout={logout} />;
}

function AccountDashboard({
  userName,
  onLogout,
}: {
  userName: string;
  onLogout: () => void;
}) {
  const { config } = useConfig();
  const { addPlan } = useCart();
  const [added, setAdded] = useState<Record<string, boolean>>({});

  const contracts = useMemo(
    () => MOCK_CURRENT_CONTRACTS.map(findPlan).filter(Boolean) as NonNullable<ReturnType<typeof findPlan>>[],
    [],
  );
  const recentViewed = useMemo(
    () => MOCK_RECENT_VIEWED.map(findPlan).filter(Boolean) as NonNullable<ReturnType<typeof findPlan>>[],
    [],
  );
  const upsell = useMemo(
    () =>
      UPSELL.map((u) => ({ plan: findPlan(u.sku), reason: u.reason })).filter(
        (u) => u.plan,
      ) as { plan: Plan; reason: string }[],
    [],
  );

  const onAdd = (plan: Plan) => {
    addPlan(plan);
    setAdded((p) => ({ ...p, [plan.sku]: true }));
    setTimeout(() => setAdded((p) => ({ ...p, [plan.sku]: false })), 1800);
  };

  // Mocked usage data for the dashboard charts.
  const monthlyKwh = [320, 295, 305, 280, 260, 245];
  const maxKwh = Math.max(...monthlyKwh);
  const minKwh = Math.min(...monthlyKwh);
  const co2Saved = 142;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-[#0a4ea8] font-semibold">
            My NovaPower
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-[#062f66] dark:text-slate-100">
            Welcome back, {userName}
          </h1>
        </div>
        <div className="flex gap-2 text-sm">
          <Link to="/" className="btn-secondary">
            <Home className="w-4 h-4" /> Home
          </Link>
          <button type="button" className="btn-secondary">
            <Settings2 className="w-4 h-4" /> Settings
          </button>
          <button type="button" onClick={onLogout} className="btn-secondary">
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </div>

      {/* KPI tiles */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <KpiTile
          icon={<Zap className="w-4 h-4" />}
          label="Monthly bill"
          value={`84,90 ${config.currency}`}
          delta="-12% vs last month"
          tone="positive"
        />
        <KpiTile
          icon={<Activity className="w-4 h-4" />}
          label="Energy used"
          value="245 kWh"
          delta="-15 kWh vs last month"
          tone="positive"
        />
        <KpiTile
          icon={<Leaf className="w-4 h-4" />}
          label="CO₂ saved"
          value={`${co2Saved} kg`}
          delta="this year"
        />
        <KpiTile
          icon={<FileText className="w-4 h-4" />}
          label="Active plans"
          value={String(contracts.length)}
          delta="No issues"
          tone="positive"
        />
      </section>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Active contracts */}
        <section>
          <h2 className="font-bold text-[#062f66] mb-3 dark:text-slate-100">Your active plans</h2>
          <div className="space-y-3">
            {contracts.map((c) => (
              <article
                key={c.sku}
                className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 dark:bg-slate-800 dark:border-slate-700"
              >
                <img
                  src={c.image_url}
                  alt=""
                  className="w-20 h-20 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] uppercase tracking-wide text-[#1a8c45] font-semibold">
                    {c.energy_source ?? c.category_l1} · Active
                  </div>
                  <Link to={c.url} className="block font-semibold text-[#062f66] hover:underline dark:text-slate-100">
                    {c.name}
                  </Link>
                  <div className="text-xs text-gray-500 mt-0.5 dark:text-slate-400">
                    Renews {new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toLocaleDateString()}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                    {c.speed_mbps && (
                      <span className="px-1.5 py-0.5 bg-[#e9f2ff] text-[#0a4ea8] rounded dark:bg-blue-900/40 dark:text-blue-400">
                        {c.speed_mbps} Mb
                      </span>
                    )}
                    {c.data_allowance && (
                      <span className="px-1.5 py-0.5 bg-[#fff5d6] text-[#a37200] rounded dark:bg-amber-900/40 dark:text-amber-400">
                        {c.data_allowance}
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded dark:bg-slate-700 dark:text-slate-300">
                      {c.contract_length}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-[#062f66] dark:text-blue-300">
                    {c.price.toFixed(2).replace('.', ',')} {config.currency}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-slate-400">/ month</div>
                  <button
                    type="button"
                    className="mt-2 text-[11px] text-[#0a4ea8] hover:underline"
                  >
                    Manage
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Usage chart */}
          <h2 className="mt-8 font-bold text-[#062f66] mb-3 dark:text-slate-100">Energy usage (last 6 months)</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-end gap-3 h-44">
              {monthlyKwh.map((v, i) => {
                // Scale between min and max so month-to-month differences stay visible
                // (raw values sit close together, e.g. 245–320 kWh).
                const height = 35 + Math.round(((v - minKwh) / (maxKwh - minKwh)) * 65);
                return (
                  <div key={i} className="flex-1 h-full flex flex-col items-center justify-end gap-1">
                    <div className="text-[10px] text-gray-500 dark:text-slate-400">{v}</div>
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-[#0a4ea8] to-[#00b4d8] min-h-[4px] transition-[height] duration-500"
                      style={{ height: `${height}%` }}
                    />
                    <div className="text-[10px] text-gray-500 dark:text-slate-400">M{i + 1}</div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-gray-500 dark:text-slate-400">
              You're using <strong className="text-[#1a8c45]">15% less</strong> than the
              average household in your area. Nice work!
            </p>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 p-5 dark:bg-slate-800 dark:border-slate-700">
            <h3 className="font-semibold text-[#062f66] dark:text-slate-100">Last invoice</h3>
            <div className="mt-2 text-2xl font-extrabold text-[#062f66] dark:text-blue-300">
              84,90 {config.currency}
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400">Charged on the 1st of next month.</p>
            <button type="button" className="mt-3 btn-secondary w-full text-xs">
              <FileText className="w-3.5 h-3.5" /> Download PDF
            </button>
          </div>

          <div className="bg-[#e9f7ed] rounded-xl p-5 text-[#1a8c45] dark:bg-emerald-900/40 dark:text-emerald-400">
            <Leaf className="w-5 h-5" />
            <p className="mt-2 text-sm font-semibold">You've saved {co2Saved} kg of CO₂ this year</p>
            <p className="text-xs mt-1">
              That's the equivalent of planting 6 trees. Keep it up!
            </p>
          </div>
        </aside>
      </div>

      {/* Recently viewed */}
      <section className="mt-12">
        <h2 className="font-bold text-[#062f66] mb-3 dark:text-slate-100">Recently viewed</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {recentViewed.map((p) => (
            <Link
              key={p.sku}
              to={p.url}
              className="rounded-xl bg-white border border-gray-200 hover:border-[#0a4ea8]/40 overflow-hidden dark:bg-slate-800 dark:border-slate-700"
            >
              <img src={p.image_url} alt={p.name} className="w-full h-28 object-cover" />
              <div className="p-3">
                <div className="text-sm font-semibold leading-tight line-clamp-2 dark:text-slate-100">{p.name}</div>
                <div className="text-sm font-bold text-[#062f66] mt-1 dark:text-blue-300">
                  {p.price.toFixed(2).replace('.', ',')} {config.currency}/mo
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Upsell — curated upgrades with easy one-tap add to cart */}
      <section className="mt-12">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-5 h-5 text-[#1a8c45]" />
          <h2 className="font-bold text-[#062f66] dark:text-slate-100">Recommended upgrades for you</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4 dark:text-slate-400">
          Based on your active plans — add any of these in one tap.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {upsell.map(({ plan, reason }) => (
            <div
              key={plan.sku}
              className="flex flex-col rounded-xl bg-white border border-gray-200 overflow-hidden hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-slate-700"
            >
              <Link to={plan.url} className="block relative">
                <img src={plan.image_url} alt={plan.name} className="w-full h-32 object-cover" />
                <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1a8c45] text-white text-[10px] font-semibold">
                  <Sparkles className="w-3 h-3" /> For you
                </span>
              </Link>
              <div className="p-3 flex flex-col flex-1">
                <Link
                  to={plan.url}
                  className="text-sm font-semibold leading-tight line-clamp-2 hover:underline dark:text-slate-100"
                >
                  {plan.name}
                </Link>
                <p className="mt-1 text-[11px] text-gray-500 line-clamp-2 dark:text-slate-400">{reason}</p>
                <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                  <div className="text-sm font-bold text-[#062f66] dark:text-blue-300">
                    {plan.price.toFixed(2).replace('.', ',')} {config.currency}
                    <span className="text-[11px] font-normal text-gray-500 dark:text-slate-400">/mo</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAdd(plan)}
                    className={added[plan.sku] ? 'btn-green text-xs px-3 py-1.5' : 'btn-primary text-xs px-3 py-1.5'}
                  >
                    {added[plan.sku] ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Added
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Add
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Link
          to="/cart"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#0a4ea8] hover:underline dark:text-blue-400"
        >
          Go to cart <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* [DY INTEGRATION] Account-level recommendations — DY Choose selector
          "Account Recommendations". DY personalizes based on the user's full
          affinity profile and known contracts. */}
      <div className="mt-12">
        <RecommendationsWidget
          selectorName="Account Recommendations"
          title="Recommended add-ons for you"
          pageType="OTHER"
          pageData={{ activeContracts: contracts.map((c) => c.sku) }}
          fallbackPlans={plans
            .filter((p) => p.plan_type === 'Add-on' || p.plan_type === 'Smart Home')
            .slice(0, 4)}
        />
      </div>
    </div>
  );
}

function KpiTile({
  icon,
  label,
  value,
  delta,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta?: string;
  tone?: 'positive';
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 dark:bg-slate-800 dark:border-slate-700">
      <div className="text-[#0a4ea8] flex items-center gap-1.5 text-[11px] uppercase tracking-wide font-semibold">
        {icon}
        {label}
      </div>
      <div className="text-xl md:text-2xl font-extrabold text-[#062f66] mt-1 dark:text-slate-100">{value}</div>
      {delta && (
        <div
          className={
            'text-[11px] mt-0.5 ' +
            (tone === 'positive' ? 'text-[#1a8c45]' : 'text-gray-500 dark:text-slate-400')
          }
        >
          {delta}
        </div>
      )}
    </div>
  );
}
