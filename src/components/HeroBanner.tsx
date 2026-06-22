import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Leaf, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { dySlots, logDYSlot } from '../config/dy-slots';
import DYSlotBadge from './DYSlotBadge';
import { useDYSlotOverride } from '../hooks/useDYSlotOverride';

// [DY INTEGRATION] Personalized hero banner. The selector
// "NovaPower Homepage Hero" should be created in the DY console as an
// experience that returns one of the variations below depending on the
// visitor's segment (residential vs business, geo, browsing history, etc).
//
// The DY response's `payload.data` is expected to look like:
//   { headline, subhead, ctaLabel, ctaHref, image, theme: 'green' | 'fiber' | 'mobile' | 'bundle' | 'insurance' }
// When DY isn't reachable we render an auto-rotating carousel of fallbacks,
// each with its own category video, so the demo stays lively and on-brand.

interface HeroVariation {
  headline: string;
  subhead: string;
  ctaLabel: string;
  ctaHref: string;
  badge?: string;
  theme?: 'green' | 'fiber' | 'mobile' | 'bundle' | 'insurance';
  image?: string;
  video?: string;
}

const SLIDES: HeroVariation[] = [
  {
    headline: 'Switch to 100% green energy in 5 minutes',
    subhead: 'No commitment, no setup fee. Save up to 23% on your bill.',
    ctaLabel: 'See EcoFlex Green',
    ctaHref: '/plan/ELEC-GREEN-100',
    badge: 'New',
    theme: 'green',
    image: 'https://images.pexels.com/photos/32408717/pexels-photo-32408717.jpeg?auto=compress&cs=tinysrgb&w=1600',
    video: 'https://videos.pexels.com/video-files/34955900/14807735_1280_720_25fps.mp4',
  },
  {
    headline: 'Fiber 1 Gb + 5G Mobile from €39.99',
    subhead: 'Bundle and save 20%. Wi-Fi 6 router included.',
    ctaLabel: 'See NovaConnect',
    ctaHref: '/plan/BND-DUAL-FM',
    badge: 'Most Popular',
    theme: 'fiber',
    image: 'https://images.pexels.com/photos/18999170/pexels-photo-18999170.jpeg?auto=compress&cs=tinysrgb&w=1600',
    video: 'https://videos.pexels.com/video-files/30825655/13183206_1920_1080_25fps.mp4',
  },
  {
    headline: 'Unlimited 5G that follows you everywhere',
    subhead: 'NovaMobile Unlimited from €19.99/mo. Keep your number, free eSIM.',
    ctaLabel: 'See mobile plans',
    ctaHref: '/plans/mobile',
    badge: '5G',
    theme: 'mobile',
    image: 'https://images.pexels.com/videos/29920264/pexels-photo-29920264.jpeg?auto=compress&cs=tinysrgb&w=1600',
    video: 'https://videos.pexels.com/video-files/29920264/12841916_1920_1080_30fps.mp4',
  },
  {
    headline: 'Make your home smart and save energy',
    subhead: 'Thermostats, plugs & EV chargers that cut your bills automatically.',
    ctaLabel: 'Explore Smart Home',
    ctaHref: '/plans/smart-home',
    badge: 'Bundle & Save',
    theme: 'bundle',
    image: 'https://images.pexels.com/videos/35999366/pexels-photo-35999366.jpeg?auto=compress&cs=tinysrgb&w=1600',
    video: 'https://videos.pexels.com/video-files/35999366/15264818_1280_720_60fps.mp4',
  },
  {
    headline: 'Protect your family, home & devices',
    subhead: 'Insurance plans from €3.99/mo. No paperwork, instant cover.',
    ctaLabel: 'Get a quote',
    ctaHref: '/plans/insurance',
    badge: 'New',
    theme: 'insurance',
    image: 'https://images.pexels.com/videos/35287925/pexels-photo-35287925.jpeg?auto=compress&cs=tinysrgb&w=1600',
    video: 'https://videos.pexels.com/video-files/35287925/14950195_1280_720_50fps.mp4',
  },
];

function gradientFor(theme?: HeroVariation['theme']) {
  if (theme === 'green') return 'bg-gradient-to-br from-[#062f66]/80 via-[#1a8c45]/60 to-transparent';
  if (theme === 'insurance') return 'bg-gradient-to-br from-[#1e293b]/85 via-[#0a4ea8]/50 to-transparent';
  if (theme === 'mobile') return 'bg-gradient-to-br from-[#3b0764]/80 via-[#0a4ea8]/55 to-transparent';
  return 'bg-gradient-to-br from-[#062f66]/85 via-[#0a4ea8]/60 to-transparent';
}

function badgeIconFor(theme?: HeroVariation['theme']) {
  if (theme === 'green') return Leaf;
  if (theme === 'insurance') return ShieldCheck;
  if (theme === 'mobile') return Smartphone;
  return Sparkles;
}

export default function HeroBanner() {
  // [DY INTEGRATION] Native client-side hero slot. The carousel below is the
  // default content; DY personalizes it by targeting `#${dySlots.homepageHero}`
  // with a Custom Action when a homepage hero campaign is live.
  const slotRef = useRef<HTMLElement>(null);
  const overridden = useDYSlotOverride(slotRef);

  useEffect(() => {
    logDYSlot(dySlots.homepageHero, 'homepage hero');
  }, []);

  const slides = SLIDES;
  const count = slides.length;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index > count - 1) setIndex(0);
  }, [count, index]);

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 7000);
    return () => clearInterval(t);
  }, [count, index]);

  const variation = slides[Math.min(index, count - 1)];
  const BadgeIcon = badgeIconFor(variation.theme);
  const go = (n: number) => setIndex((n + count) % count);

  return (
    <section
      id={dySlots.homepageHero}
      ref={slotRef}
      data-dy-slot={dySlots.homepageHero}
      className="relative overflow-hidden rounded-2xl shadow-2xl"
      style={{ minHeight: '500px' }}
    >
      {/* Single direct child wrapping the React fallback. `display:contents`
          keeps absolute-positioned children anchored to the section while
          giving the override-detector one stable direct child to watch. */}
      <div data-dy-fallback style={{ display: 'contents' }}>
      {/* Crossfading media layer (image poster + looping video per slide) */}
      <AnimatePresence mode="sync">
        <motion.div
          key={index}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        >
          {variation.image && (
            <motion.img
              src={variation.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 12, ease: 'easeOut' }}
            />
          )}
          {variation.video && (
            <video
              key={variation.video}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              poster={variation.image}
              aria-hidden="true"
            >
              <source src={variation.video} type="video/mp4" />
            </video>
          )}
          <div className={`absolute inset-0 ${gradientFor(variation.theme)}`} />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <motion.div
        key={`content-${index}`}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 flex flex-col justify-end h-full px-6 py-12 md:px-16 md:py-20 max-w-3xl"
        style={{ minHeight: '500px' }}
      >
        {variation.badge && (
          <span className="inline-flex items-center gap-1.5 mb-4 self-start px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm text-white border border-white/20">
            <BadgeIcon className="w-3.5 h-3.5" aria-hidden="true" />
            {variation.badge}
          </span>
        )}
        <h1 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight text-white drop-shadow-lg">
          {variation.headline}
        </h1>
        <p className="mt-3 md:mt-4 text-base md:text-lg text-white/90 max-w-xl drop-shadow">
          {variation.subhead}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={variation.ctaHref}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#062f66] hover:bg-white/90 transition shadow-lg"
          >
            {variation.ctaLabel}
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link
            to="/plans/bundles"
            className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition backdrop-blur-sm"
          >
            Compare all plans
          </Link>
        </div>
      </motion.div>

      {/* Carousel controls */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 grid place-items-center w-10 h-10 rounded-full bg-black/25 hover:bg-black/45 text-white backdrop-blur-sm transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 grid place-items-center w-10 h-10 rounded-full bg-black/25 hover:bg-black/45 text-white backdrop-blur-sm transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className={
                  'h-2 rounded-full transition-all ' +
                  (i === index ? 'w-7 bg-white' : 'w-2 bg-white/50 hover:bg-white/80')
                }
              />
            ))}
          </div>
        </>
      )}
      </div>
      <DYSlotBadge overridden={overridden} slot={dySlots.homepageHero} />
    </section>
  );
}
