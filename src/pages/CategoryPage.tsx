import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react';

import PlanCard from '../components/PlanCard';
import RecommendationsWidget from '../components/RecommendationsWidget';
import { featuredCategories, plansByCategory } from '../data/plans';
import type { Plan } from '../types';
import { dySlots } from '../config/dy-slots';

interface CategoryPageProps {
  onVisualSearch?: (productImageUrl?: string) => void;
}

type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'rating';

export default function CategoryPage({ onVisualSearch }: CategoryPageProps) {
  const { category = 'electricity' } = useParams<{ category: string }>();
  const meta = featuredCategories.find((c) => c.slug === category);

  const allPlans = useMemo(
    () => plansByCategory(category.replace('-', ' ')),
    [category],
  );

  const [sort, setSort] = useState<SortKey>('recommended');
  const [customer, setCustomer] = useState<'All' | 'Residential' | 'Business'>('All');
  const [contract, setContract] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(200);
  const [greenOnly, setGreenOnly] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const contracts = useMemo(() => {
    const set = new Set<string>();
    allPlans.forEach((p) => p.contract_length && set.add(p.contract_length));
    return ['All', ...Array.from(set)];
  }, [allPlans]);

  const filtered = useMemo(() => {
    let list = allPlans.filter((p) => p.price <= maxPrice);
    if (customer !== 'All') {
      list = list.filter((p) => p.customer_type === customer || p.customer_type === 'Both');
    }
    if (contract !== 'All') {
      list = list.filter((p) => p.contract_length === contract);
    }
    if (greenOnly) {
      list = list.filter((p) => p.eco_aware);
    }
    switch (sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list = [...list].sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0));
        break;
      default:
        break;
    }
    return list;
  }, [allPlans, customer, contract, maxPrice, greenOnly, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-3 flex items-center gap-1 dark:text-slate-400">
        <Link to="/" className="hover:underline">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/plans/bundles" className="hover:underline">Plans</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-gray-700 font-medium dark:text-slate-200">{meta?.label ?? category}</span>
      </nav>

      {/* Hero */}
      <header className="rounded-2xl overflow-hidden relative mb-6">
        <div
          className="aspect-[5/1.6] md:aspect-[6/1.4] bg-cover bg-center"
          style={{ backgroundImage: `url(${meta?.image ?? ''})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#062f66]/85 via-[#062f66]/55 to-transparent" />
        <div className="absolute inset-0 flex items-center px-6 md:px-10">
          <div className="text-white max-w-xl">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
              {meta?.label ?? category}
            </h1>
            <p className="mt-2 text-sm md:text-base text-white/90">
              {meta?.description ??
                'Plans tailored to your home — switch in 5 minutes, cancel anytime.'}
            </p>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <p className="text-sm text-gray-600 dark:text-slate-400">
          <strong className="text-[#062f66]">{filtered.length}</strong> plans found
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden inline-flex items-center gap-1 text-sm border border-gray-200 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
          <label className="text-sm text-gray-600 inline-flex items-center gap-2 dark:text-slate-400">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
            >
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-6">
        {/* Facets sidebar */}
        <aside className="hidden lg:block">
          <FacetPanel
            customer={customer}
            setCustomer={setCustomer}
            contracts={contracts}
            contract={contract}
            setContract={setContract}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            greenOnly={greenOnly}
            setGreenOnly={setGreenOnly}
          />
        </aside>

        {/* Results grid */}
        <section>
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center dark:bg-slate-800 dark:border-slate-700">
              <p className="text-sm text-gray-600 dark:text-slate-400">
                No plans match these filters. Try widening your criteria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((p: Plan) => (
                <PlanCard key={p.sku} plan={p} onVisualSearch={onVisualSearch} />
              ))}
            </div>
          )}

          {/* [DY INTEGRATION] Category recommendations slot — DY targets #dy-slot-category-recs.
              Current category flows to DY via window.DY.recommendationContext (useDYContext). */}
          <div className="mt-10">
            <RecommendationsWidget
              slot={dySlots.categoryRecs}
              label="category recs"
              title="You might also like"
              fallbackPlans={allPlans.slice(0, 4)}
              onVisualSearch={onVisualSearch}
            />
          </div>
        </section>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85%] bg-white p-4 overflow-y-auto custom-scrollbar dark:bg-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold dark:text-slate-100">Filters</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <FacetPanel
              customer={customer}
              setCustomer={setCustomer}
              contracts={contracts}
              contract={contract}
              setContract={setContract}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              greenOnly={greenOnly}
              setGreenOnly={setGreenOnly}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface FacetProps {
  customer: 'All' | 'Residential' | 'Business';
  setCustomer: (v: 'All' | 'Residential' | 'Business') => void;
  contracts: string[];
  contract: string;
  setContract: (v: string) => void;
  maxPrice: number;
  setMaxPrice: (v: number) => void;
  greenOnly: boolean;
  setGreenOnly: (v: boolean) => void;
}

function FacetPanel(p: FacetProps) {
  return (
    <div className="space-y-5 text-sm rounded-xl border border-gray-200 bg-white p-4 dark:bg-slate-800 dark:border-slate-700">
      <div>
        <h3 className="font-semibold text-[#062f66] mb-2 dark:text-slate-100">Customer type</h3>
        <div className="space-y-1.5">
          {(['All', 'Residential', 'Business'] as const).map((opt) => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-slate-300">
              <input
                type="radio"
                name="customer"
                checked={p.customer === opt}
                onChange={() => p.setCustomer(opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-[#062f66] mb-2 dark:text-slate-100">Contract length</h3>
        <select
          className="w-full border border-gray-200 rounded-lg px-2 py-1.5 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
          value={p.contract}
          onChange={(e) => p.setContract(e.target.value)}
        >
          {p.contracts.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-semibold text-[#062f66] mb-2 dark:text-slate-100">Max monthly price</h3>
        <input
          type="range"
          min={5}
          max={200}
          step={5}
          value={p.maxPrice}
          onChange={(e) => p.setMaxPrice(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-xs text-gray-600 mt-1 dark:text-slate-400">Up to {p.maxPrice} €/mo</div>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer text-gray-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={p.greenOnly}
            onChange={(e) => p.setGreenOnly(e.target.checked)}
          />
          <span className="font-semibold text-[#1a8c45]">Eco plans only</span>
        </label>
      </div>
    </div>
  );
}
