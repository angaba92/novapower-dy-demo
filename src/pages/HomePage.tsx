import { ArrowRight, BadgeCheck, Calculator, Clock, Leaf, Newspaper, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

import HeroBanner from '../components/HeroBanner';
import RecommendationsWidget from '../components/RecommendationsWidget';
import BundleBuilder from '../components/BundleBuilder';
import AppPromoBanner from '../components/AppPromoBanner';
import { MastercardStrip } from '../components/MastercardPromo';
import { blogPosts, formatBlogDate } from '../data/blog';
import { featuredCategories, findPlan, plans } from '../data/plans';
import { dySlots } from '../config/dy-slots';

interface HomePageProps {
  onVisualSearch?: (productImageUrl?: string) => void;
}

const FALLBACK_HERO_RECS = [
  'BND-DUAL-FM',
  'ELEC-GREEN-100',
  'FIBER-600',
  'BND-TRIPLE',
]
  .map(findPlan)
  .filter(Boolean) as any[];

const FALLBACK_TRENDING = [
  'MOB-CON-25',
  'SH-SOLAR-3K',
  'GAS-FIXED-24',
  'BND-GREEN',
]
  .map(findPlan)
  .filter(Boolean) as any[];

export default function HomePage({ onVisualSearch }: HomePageProps) {
  const ecoPlans = plans.filter((p) => p.eco_aware).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* [DY INTEGRATION] Personalized hero banner — DY Choose selector
          "NovaPower Homepage Hero" */}
      <HeroBanner />

      {/* Featured categories (site nav mirror) */}
      <section className="my-10">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold dark:text-slate-100">Find what you need</h2>
          <Link to="/plans/bundles" className="text-sm text-[#0a4ea8] font-semibold hover:underline">
            See all categories →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {featuredCategories.map((c) => (
            <Link
              key={c.slug}
              to={`/plans/${c.slug}`}
              className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 hover:border-[#0a4ea8]/40 transition dark:border-slate-700"
            >
              <img src={c.image} alt={c.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#062f66]/85 via-[#062f66]/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                <div className="text-base font-bold">{c.label}</div>
                <div className="text-[11px] text-white/85 line-clamp-2">{c.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* [DY INTEGRATION] Recommendations slot — DY targets #dy-slot-homepage-recs */}
      <RecommendationsWidget
        slot={dySlots.homepageRecs}
        label="homepage recs"
        title="Recommended for you"
        fallbackPlans={FALLBACK_HERO_RECS}
        onVisualSearch={onVisualSearch}
      />

      {/* Mastercard pay-and-save promotion */}
      <MastercardStrip />

      {/* Planes conjuntos — interactive bundle builder */}
      <BundleBuilder />

      {/* App download — manage everything from the app */}
      <AppPromoBanner />

      {/* Why switch */}
      <section className="my-12 rounded-2xl bg-white border border-gray-200 p-6 md:p-10 dark:bg-slate-800 dark:border-slate-700">
        <div className="grid md:grid-cols-3 gap-6 md:gap-10 items-start">
          <div className="md:col-span-1">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight dark:text-slate-100">Why switch to NovaPower?</h2>
            <p className="mt-3 text-gray-600 text-sm md:text-base dark:text-slate-400">
              We're a one-stop shop for everything that powers your home — energy, broadband, mobile,
              and the smart devices that tie it all together.
            </p>
            <Link to="/plans/bundles" className="btn-primary mt-5 inline-flex">
              See all plans <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <ul className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <li className="rounded-xl border border-gray-200 p-4 dark:bg-slate-700 dark:border-slate-600">
              <Leaf className="w-5 h-5 text-[#1a8c45]" />
              <h3 className="mt-2 font-semibold dark:text-slate-100">100% renewable origin</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">Every kWh we sell is matched with a certified renewable origin guarantee.</p>
            </li>
            <li className="rounded-xl border border-gray-200 p-4 dark:bg-slate-700 dark:border-slate-600">
              <Calculator className="w-5 h-5 text-[#0a4ea8]" />
              <h3 className="mt-2 font-semibold dark:text-slate-100">Save up to 30%</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">Bundle electricity, gas, fiber and mobile in one bill — save up to 30% vs. buying separately.</p>
            </li>
            <li className="rounded-xl border border-gray-200 p-4 dark:bg-slate-700 dark:border-slate-600">
              <Zap className="w-5 h-5 text-[#ffc857]" />
              <h3 className="mt-2 font-semibold dark:text-slate-100">Switch in 5 minutes</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">Online sign-up, no paperwork. We handle the switch with your previous provider.</p>
            </li>
            <li className="rounded-xl border border-gray-200 p-4 dark:bg-slate-700 dark:border-slate-600">
              <BadgeCheck className="w-5 h-5 text-[#0a4ea8]" />
              <h3 className="mt-2 font-semibold dark:text-slate-100">Trusted by 1.4M households</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">A NovaPower customer joins us every 90 seconds. Average satisfaction: 4.6 ★.</p>
            </li>
          </ul>
        </div>
      </section>

      {/* Eco strip */}
      <section className="my-12">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold dark:text-slate-100">Our green commitment</h2>
            <p className="text-sm text-gray-600 dark:text-slate-400">Plans certified by ECO-100 and AENOR. 100% verified renewable mix.</p>
          </div>
          <Link to="/plans/bundles" className="text-sm text-[#1a8c45] font-semibold hover:underline">
            All eco plans →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ecoPlans.map((p) => (
            <Link key={p.sku} to={p.url} className="rounded-xl overflow-hidden bg-white border border-gray-200 hover:border-[#1a8c45]/40 transition dark:bg-slate-800 dark:border-slate-700">
              <img src={p.image_url} alt={p.name} className="w-full h-32 object-cover" loading="lazy" />
              <div className="p-3">
                <div className="text-[11px] uppercase tracking-wide text-[#1a8c45]">{p.energy_source ?? 'Eco'}</div>
                <div className="font-semibold text-sm leading-tight line-clamp-2 mt-0.5 dark:text-slate-100">{p.name}</div>
                <div className="text-sm font-bold text-[#062f66] mt-1.5 dark:text-blue-300">
                  {p.price.toFixed(2).replace('.', ',')} €/mo
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Insights / blog teaser */}
      <section className="my-12">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold dark:text-slate-100 inline-flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-[#0a4ea8]" /> From our Insights
            </h2>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Guides on saving energy, connectivity, e-mobility and protection.
            </p>
          </div>
          <Link to="/blog" className="text-sm text-[#0a4ea8] font-semibold hover:underline">
            All articles →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {blogPosts.slice(0, 3).map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group rounded-2xl overflow-hidden bg-white border border-gray-200 hover:border-[#0a4ea8]/40 transition dark:bg-slate-800 dark:border-slate-700"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-white/90 text-[#062f66]">
                  {post.category}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-[#062f66] leading-snug line-clamp-2 dark:text-slate-100">
                  {post.title}
                </h3>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-gray-500 dark:text-slate-400">
                  <span>{formatBlogDate(post.date)}</span>
                  <span className="text-gray-300 dark:text-slate-600">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {post.readingMins} min
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* [DY INTEGRATION] Trending slot — DY targets #dy-slot-homepage-trending */}
      <RecommendationsWidget
        slot={dySlots.homepageTrending}
        label="homepage trending"
        title="Trending across NovaPower"
        fallbackPlans={FALLBACK_TRENDING}
        onVisualSearch={onVisualSearch}
      />
    </div>
  );
}
