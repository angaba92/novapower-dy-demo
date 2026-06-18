import { motion } from 'framer-motion';
import { ArrowRight, Camera, Clock, Search as SearchIcon, TrendingUp, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { featuredCategories, plans } from '../data/plans';
import { useConfig } from '../context/ConfigContext';
import type { Plan } from '../types';

interface SearchOverlayProps {
  onClose: () => void;
  onOpenVisualSearch?: () => void;
}

const POPULAR = ['Fiber 1 Gb', 'Green electricity', 'EV charger', '5G mobile', 'Home insurance', 'Smart thermostat'];
const RECENT_KEY = 'novapower_recent_searches';

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (raw) return (JSON.parse(raw) as string[]).slice(0, 6);
  } catch {
    /* ignore */
  }
  return [];
}

function pushRecent(term: string) {
  const t = term.trim();
  if (!t) return;
  try {
    const next = [t, ...readRecent().filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, 6);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export default function SearchOverlay({ onClose, onOpenVisualSearch }: SearchOverlayProps) {
  const navigate = useNavigate();
  const { config } = useConfig();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState<string[]>(() => readRecent());

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Live preview results from the local catalog (mirrors the DY product feed).
  const results = useMemo<Plan[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const scored = plans
      .map((p) => {
        const name = p.name.toLowerCase();
        const haystack = [p.name, p.category_l1, p.category_l2, p.keywords, p.description, p.energy_source]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        let score = 0;
        if (name.startsWith(q)) score += 100;
        else if (name.includes(q)) score += 50;
        if (haystack.includes(q)) score += 10;
        return { p, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((s) => s.p);
    return scored;
  }, [query]);

  // Matching top-level categories for quick jumps.
  const categoryMatches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return featuredCategories.filter((c) => c.label.toLowerCase().includes(q)).slice(0, 3);
  }, [query]);

  useEffect(() => {
    setActive(-1);
  }, [query]);

  const goToResults = (term: string) => {
    const q = term.trim();
    if (!q) return;
    pushRecent(q);
    navigate(`/search?q=${encodeURIComponent(q)}`);
    onClose();
  };

  const openPlan = (plan: Plan) => {
    pushRecent(query.trim() || plan.name);
    navigate(plan.url);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (active >= 0 && results[active]) openPlan(results[active]);
      else goToResults(query);
    }
  };

  const hasQuery = query.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[10vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className="absolute inset-0 bg-[#04122b]/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ y: -16, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -16, opacity: 0, scale: 0.98 }}
        transition={{ type: 'tween', duration: 0.2 }}
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden dark:bg-slate-800 dark:border dark:border-slate-700"
      >
        {/* Input row */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-slate-700">
          <SearchIcon className="w-5 h-5 text-[#0a4ea8] shrink-0 dark:text-blue-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search plans, devices, FAQs…"
            className="flex-1 bg-transparent text-base outline-none placeholder-gray-400 dark:text-slate-100 dark:placeholder-slate-500"
          />
          {onOpenVisualSearch && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenVisualSearch();
              }}
              className="p-1.5 rounded-lg text-gray-500 hover:text-[#0a4ea8] hover:bg-[#f5faff] dark:text-slate-400 dark:hover:bg-slate-700"
              title="Visual search"
              aria-label="Visual search"
            >
              <Camera className="w-5 h-5" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-slate-700"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Empty state — suggestions */}
          {!hasQuery && (
            <div className="p-4 space-y-5">
              {recent.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5 dark:text-slate-500">
                    <Clock className="w-3.5 h-3.5" /> Recent
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => goToResults(r)}
                        className="px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-[#e9f2ff] hover:text-[#0a4ea8] dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                      >
                        {r}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.removeItem(RECENT_KEY);
                        setRecent([]);
                      }}
                      className="px-2 py-1.5 text-xs text-gray-400 hover:text-[#cc0000]"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1.5 dark:text-slate-500">
                  <TrendingUp className="w-3.5 h-3.5" /> Popular searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {POPULAR.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => goToResults(p)}
                      className="px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-[#e9f2ff] hover:text-[#0a4ea8] dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2 dark:text-slate-500">
                  Browse categories
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {featuredCategories.map((c) => (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => {
                        navigate(`/plans/${c.slug}`);
                        onClose();
                      }}
                      className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-left hover:border-[#0a4ea8]/40 hover:bg-[#f5faff] dark:border-slate-700 dark:hover:bg-slate-700"
                    >
                      <img src={c.image} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                      <span className="font-medium leading-tight dark:text-slate-200">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Results state */}
          {hasQuery && (
            <div className="py-2">
              {categoryMatches.length > 0 && (
                <div className="px-2 pb-1">
                  <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                    Categories
                  </p>
                  {categoryMatches.map((c) => (
                    <button
                      key={c.slug}
                      type="button"
                      onClick={() => {
                        navigate(`/plans/${c.slug}`);
                        onClose();
                      }}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left hover:bg-[#f5faff] dark:hover:bg-slate-700"
                    >
                      <span className="grid place-items-center w-9 h-9 rounded-lg bg-[#e9f2ff] text-[#0a4ea8] dark:bg-slate-700 dark:text-blue-400">
                        <SearchIcon className="w-4 h-4" />
                      </span>
                      <span className="text-sm dark:text-slate-200">
                        Browse all <strong>{c.label}</strong> plans
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {results.length > 0 ? (
                <div className="px-2">
                  <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                    Products
                  </p>
                  {results.map((p, i) => (
                    <button
                      key={p.sku}
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => openPlan(p)}
                      className={
                        'w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left transition ' +
                        (active === i
                          ? 'bg-[#e9f2ff] dark:bg-slate-700'
                          : 'hover:bg-[#f5faff] dark:hover:bg-slate-700')
                      }
                    >
                      <img
                        src={p.image_url}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover shrink-0 border border-gray-100 dark:border-slate-600"
                        loading="lazy"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold leading-tight line-clamp-1 dark:text-slate-100">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-slate-400">
                          {p.category_l1}
                          {p.category_l2 ? ` · ${p.category_l2}` : ''}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-[#062f66] dark:text-blue-300">
                          {p.price.toFixed(2).replace('.', ',')} {config.currency}
                        </div>
                        <div className="text-[10px] text-gray-400 dark:text-slate-500">/ mo</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                categoryMatches.length === 0 && (
                  <p className="px-4 py-8 text-center text-sm text-gray-500 dark:text-slate-400">
                    No quick matches for "{query.trim()}". Press Enter for a full search.
                  </p>
                )
              )}

              {/* See all results */}
              <button
                type="button"
                onClick={() => goToResults(query)}
                className="mt-1 w-full flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm font-semibold text-[#0a4ea8] hover:bg-[#f5faff] dark:border-slate-700 dark:text-blue-400 dark:hover:bg-slate-700"
              >
                <span>
                  See all results for "<span className="font-bold">{query.trim()}</span>"
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
