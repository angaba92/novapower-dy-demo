import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, ChevronRight, Clock } from 'lucide-react';

import { blogPosts, findPost, formatBlogDate } from '../data/blog';
import { findPlan } from '../data/plans';
import { useConfig } from '../context/ConfigContext';
import { trackEvent } from '../utils/dyEvents';
import type { Plan } from '../types';

export default function BlogPostPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const post = findPost(slug);
  const { config } = useConfig();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (post) {
      // [DY INTEGRATION] Content engagement event so DY can build affinity from
      // editorial reads, not just product views.
      trackEvent('Content View', { contentId: post.slug, category: post.category });
    }
  }, [post?.slug]);

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2 dark:text-slate-100">Article not found</h1>
        <Link to="/blog" className="btn-primary inline-flex">Back to Insights</Link>
      </div>
    );
  }

  const relatedPlans = post.relatedSkus
    .map(findPlan)
    .filter(Boolean)
    .slice(0, 3) as Plan[];

  const morePosts = blogPosts
    .filter((p) => p.slug !== post.slug && p.category === post.category)
    .concat(blogPosts.filter((p) => p.slug !== post.slug && p.category !== post.category))
    .slice(0, 3);

  return (
    <article className="pb-6">
      {/* Hero */}
      <header className="relative">
        <div className="aspect-[16/8] md:aspect-[16/6] w-full overflow-hidden">
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04122b]/90 via-[#04122b]/45 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0">
          <div className="max-w-3xl mx-auto px-4 lg:px-8 pb-6 text-white">
            <nav className="text-xs text-white/70 mb-2 flex items-center gap-1">
              <Link to="/" className="hover:underline">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to="/blog" className="hover:underline">Insights</Link>
              <ChevronRight className="w-3 h-3" />
              <span>{post.category}</span>
            </nav>
            <span className="inline-block px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-[#ffc857] text-[#062f66]">
              {post.category}
            </span>
            <h1 className="mt-3 text-2xl md:text-4xl font-bold leading-tight max-w-2xl">
              {post.title}
            </h1>
            <div className="mt-3 flex items-center gap-3 text-sm text-white/85">
              <span className="font-medium">{post.author}</span>
              <span className="text-white/50">·</span>
              <span>{post.authorRole}</span>
              <span className="text-white/50">·</span>
              <span>{formatBlogDate(post.date)}</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {post.readingMins} min
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 lg:px-8">
        {/* Body */}
        <div className="mt-8 space-y-6">
          <p className="text-lg text-gray-700 leading-relaxed font-medium dark:text-slate-200">
            {post.excerpt}
          </p>
          {post.body.map((section, i) => (
            <section key={i}>
              {section.heading && (
                <h2 className="text-xl font-bold text-[#062f66] mt-8 mb-2 dark:text-slate-100">
                  {section.heading}
                </h2>
              )}
              {section.paragraphs.map((para, j) => (
                <p key={j} className="text-[15px] text-gray-700 leading-relaxed mb-3 dark:text-slate-300">
                  {para}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-2 space-y-2">
                  {section.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-[15px] text-gray-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-[#1a8c45] mt-1 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* Tags */}
        <div className="mt-8 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <span
              key={t}
              className="px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300"
            >
              #{t}
            </span>
          ))}
        </div>

        {/* Related plans CTA */}
        {relatedPlans.length > 0 && (
          <section className="mt-10 rounded-2xl border border-gray-200 bg-[#f5faff] p-5 md:p-6 dark:bg-slate-800 dark:border-slate-700">
            <h2 className="text-lg font-bold text-[#062f66] dark:text-slate-100">Plans mentioned in this article</h2>
            <p className="text-sm text-gray-600 mb-4 dark:text-slate-400">
              Ready to act on it? These NovaPower plans pair perfectly with this read.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {relatedPlans.map((p) => (
                <Link
                  key={p.sku}
                  to={p.url}
                  className="rounded-xl overflow-hidden bg-white border border-gray-200 hover:border-[#0a4ea8]/40 transition dark:bg-slate-700 dark:border-slate-600"
                >
                  <img src={p.image_url} alt={p.name} className="w-full h-28 object-cover" loading="lazy" />
                  <div className="p-3">
                    <div className="text-[11px] uppercase tracking-wide text-[#0a4ea8] dark:text-blue-400">
                      {p.category_l1}
                    </div>
                    <div className="font-semibold text-sm leading-tight line-clamp-2 dark:text-slate-100">
                      {p.name}
                    </div>
                    <div className="mt-1 text-sm font-bold text-[#062f66] dark:text-blue-300">
                      {p.price.toFixed(2).replace('.', ',')} {config.currency}/mo
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Back link */}
        <div className="mt-8">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0a4ea8] dark:text-blue-400">
            <ArrowLeft className="w-4 h-4" /> All articles
          </Link>
        </div>
      </div>

      {/* More articles */}
      {morePosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 lg:px-8 mt-14">
          <h2 className="text-xl font-bold text-[#062f66] mb-4 dark:text-slate-100">Keep reading</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {morePosts.map((p) => (
              <Link
                key={p.slug}
                to={`/blog/${p.slug}`}
                className="group rounded-2xl overflow-hidden border border-gray-200 bg-white hover:border-[#0a4ea8]/40 transition dark:bg-slate-800 dark:border-slate-700"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="p-4">
                  <div className="text-[11px] uppercase tracking-wide text-[#0a4ea8] dark:text-blue-400">
                    {p.category}
                  </div>
                  <h3 className="mt-1 font-bold text-[#062f66] leading-snug line-clamp-2 dark:text-slate-100">
                    {p.title}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#0a4ea8] dark:text-blue-400">
                    Read <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
