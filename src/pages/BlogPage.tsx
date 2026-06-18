import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Newspaper } from 'lucide-react';

import { blogCategories, blogPosts, formatBlogDate, type BlogCategory } from '../data/blog';

export default function BlogPage() {
  const [active, setActive] = useState<BlogCategory | 'All'>('All');

  const featured = useMemo(() => blogPosts.find((p) => p.featured) ?? blogPosts[0], []);
  const rest = useMemo(
    () =>
      blogPosts
        .filter((p) => p.slug !== featured.slug)
        .filter((p) => active === 'All' || p.category === active),
    [featured, active],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      {/* Page heading */}
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-[#0a4ea8] font-semibold inline-flex items-center gap-1.5">
          <Newspaper className="w-4 h-4" /> NovaPower Insights
        </p>
        <h1 className="text-2xl md:text-4xl font-bold text-[#062f66] dark:text-slate-100">
          Ideas to power a smarter, greener home
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-600 max-w-2xl dark:text-slate-400">
          Practical guides on energy savings, connectivity, e-mobility and protection — plus the
          latest NovaPower offers.
        </p>
      </header>

      {/* Featured article */}
      <Link
        to={`/blog/${featured.slug}`}
        className="group grid md:grid-cols-2 rounded-2xl overflow-hidden border border-gray-200 bg-white hover:border-[#0a4ea8]/40 transition dark:bg-slate-800 dark:border-slate-700"
      >
        <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden">
          <img
            src={featured.image}
            alt={featured.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-[#ffc857] text-[#062f66]">
            Featured
          </span>
        </div>
        <div className="p-6 md:p-8 flex flex-col justify-center">
          <div className="text-[11px] uppercase tracking-wide text-[#0a4ea8] font-semibold">
            {featured.category}
          </div>
          <h2 className="mt-2 text-xl md:text-2xl font-bold text-[#062f66] leading-snug dark:text-slate-100">
            {featured.title}
          </h2>
          <p className="mt-3 text-sm text-gray-600 dark:text-slate-400">{featured.excerpt}</p>
          <div className="mt-4 flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400">
            <span>{featured.author}</span>
            <span className="text-gray-300 dark:text-slate-600">·</span>
            <span>{formatBlogDate(featured.date)}</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" /> {featured.readingMins} min
            </span>
          </div>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0a4ea8] dark:text-blue-400">
            Read article <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </span>
        </div>
      </Link>

      {/* Category filter */}
      <div className="mt-8 flex flex-wrap gap-2">
        {(['All', ...blogCategories] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setActive(c)}
            className={
              'px-3.5 py-1.5 rounded-full text-sm font-medium transition border ' +
              (active === c
                ? 'bg-[#0a4ea8] text-white border-[#0a4ea8]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-[#0a4ea8]/40 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700')
            }
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {rest.map((p) => (
          <Link
            key={p.slug}
            to={`/blog/${p.slug}`}
            className="group rounded-2xl overflow-hidden border border-gray-200 bg-white hover:border-[#0a4ea8]/40 transition flex flex-col dark:bg-slate-800 dark:border-slate-700"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={p.image}
                alt={p.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-white/90 text-[#062f66]">
                {p.category}
              </span>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h3 className="font-bold text-[#062f66] leading-snug line-clamp-2 dark:text-slate-100">
                {p.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 line-clamp-2 dark:text-slate-400">{p.excerpt}</p>
              <div className="mt-auto pt-4 flex items-center gap-2 text-[11px] text-gray-500 dark:text-slate-400">
                <span>{formatBlogDate(p.date)}</span>
                <span className="text-gray-300 dark:text-slate-600">·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {p.readingMins} min
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {rest.length === 0 && (
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-10 text-center dark:bg-slate-800 dark:border-slate-700">
          <p className="text-sm text-gray-600 dark:text-slate-400">No articles in this category yet.</p>
        </div>
      )}
    </div>
  );
}
