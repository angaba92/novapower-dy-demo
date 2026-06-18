import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';

import RecommendationsWidget from '../components/RecommendationsWidget';
import { MastercardPdpPromo } from '../components/MastercardPromo';
import { useCart } from '../context/CartContext';
import { useConfig } from '../context/ConfigContext';
import { findPlan, plans } from '../data/plans';

export default function CartPage() {
  const { lines, removeLine, updateQuantity, monthlyTotal, count } = useCart();
  const { config } = useConfig();

  const annualTotal = monthlyTotal * 12;

  // Use add-on category as the cross-sell fallback when DY isn't available.
  const fallbackCrossSell = plans
    .filter((p) => p.plan_type === 'Add-on' || p.plan_type === 'Smart Home')
    .slice(0, 4);

  if (lines.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto dark:text-slate-600" />
        <h1 className="mt-3 text-2xl font-bold dark:text-slate-100">Your cart is empty</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
          Browse our plans and bundles to start saving on energy, broadband and mobile.
        </p>
        <Link to="/" className="btn-primary inline-flex mt-5">
          Explore plans
        </Link>

        {/* [DY INTEGRATION] Empty-cart recommendations — DY Choose selector
            "Cart Recommendations" with cart context. */}
        <div className="mt-12 text-left">
          <RecommendationsWidget
            selectorName="Cart Recommendations"
            title="Popular starting points"
            pageType="CART"
            fallbackPlans={fallbackCrossSell}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      <h1 className="text-2xl md:text-3xl font-bold text-[#062f66] mb-6 dark:text-slate-100">
        Your cart ({count} {count === 1 ? 'item' : 'items'})
      </h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Lines */}
        <section className="space-y-3">
          {lines.map((l) => {
            const plan = findPlan(l.sku);
            return (
              <div
                key={l.sku}
                className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 dark:bg-slate-800 dark:border-slate-700"
              >
                <Link to={`/plan/${l.sku}`} className="shrink-0">
                  {l.image_url && (
                    <img
                      src={l.image_url}
                      alt={l.name}
                      className="w-24 h-24 rounded-lg object-cover"
                    />
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-slate-400">
                    {l.category}
                  </div>
                  <Link
                    to={`/plan/${l.sku}`}
                    className="block text-sm font-semibold text-[#062f66] hover:underline dark:text-slate-100"
                  >
                    {l.name}
                  </Link>
                  {l.contract_length && (
                    <div className="text-xs text-gray-500 mt-0.5 dark:text-slate-400">{l.contract_length}</div>
                  )}
                  {plan?.eco_aware && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 bg-[#e9f7ed] text-[#1a8c45] rounded text-[10px] font-semibold">
                      Eco
                    </span>
                  )}
                  <div className="mt-2 flex items-center gap-3">
                    <div className="inline-flex items-center border border-gray-200 rounded-lg dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => updateQuantity(l.sku, l.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="px-2 py-1.5 hover:bg-gray-50 disabled:opacity-30 dark:hover:bg-slate-700"
                        disabled={l.quantity <= 1}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-sm font-medium">{l.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(l.sku, l.quantity + 1)}
                        aria-label="Increase quantity"
                        className="px-2 py-1.5 hover:bg-gray-50 dark:hover:bg-slate-700"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLine(l.sku)}
                      className="text-xs text-gray-500 hover:text-[#cc0000] inline-flex items-center gap-1 dark:text-slate-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-[#062f66] dark:text-blue-300">
                    {(l.price * l.quantity).toFixed(2).replace('.', ',')} {config.currency}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-slate-400">/ month</div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Summary */}
        <aside className="lg:sticky lg:top-20 self-start">
          <div className="bg-white rounded-xl border border-gray-200 p-5 dark:bg-slate-800 dark:border-slate-700">
            <h2 className="font-semibold text-[#062f66] dark:text-slate-100">Order summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-slate-400">Items</dt>
                <dd>{count}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600 dark:text-slate-400">Setup fees</dt>
                <dd className="text-[#1a8c45] font-semibold">FREE</dd>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2 dark:border-slate-700">
                <dt className="font-semibold">Monthly total</dt>
                <dd className="font-bold text-[#062f66] dark:text-blue-300">
                  {monthlyTotal.toFixed(2).replace('.', ',')} {config.currency}/mo
                </dd>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-slate-400">
                <dt>Estimated annual cost</dt>
                <dd>
                  {annualTotal.toFixed(2).replace('.', ',')} {config.currency}/year
                </dd>
              </div>
            </dl>
            <Link to="/checkout" className="btn-primary w-full mt-5">
              Proceed to checkout
            </Link>
            <Link
              to="/"
              className="block text-center text-xs text-[#0a4ea8] mt-3 hover:underline"
            >
              Continue shopping
            </Link>
          </div>

          <MastercardPdpPromo price={monthlyTotal} currency={config.currency} />

          <div className="mt-3 rounded-xl bg-[#e9f7ed] text-[#1a8c45] text-xs px-4 py-3 dark:bg-emerald-900/40 dark:text-emerald-400">
            Bundle electricity, gas, fiber and mobile to save up to 30%.
          </div>
        </aside>
      </div>

      {/* [DY INTEGRATION] Cross-sell on cart — DY Choose selector
          "Cart Recommendations" with cart SKUs in pageData. */}
      <div className="mt-12">
        <RecommendationsWidget
          selectorName="Cart Recommendations"
          title="Make it a complete plan"
          pageType="CART"
          pageData={{ skus: lines.map((l) => l.sku) }}
          fallbackPlans={fallbackCrossSell}
        />
      </div>
    </div>
  );
}
