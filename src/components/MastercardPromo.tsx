import { Sparkles, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mastercard "pay & save" promotion. Eligible Mastercard payments unlock an
// automatic 10% discount on the first 3 months. The logo is drawn in CSS so we
// don't ship a brand asset.

export const MASTERCARD_DISCOUNT_PCT = 10;
export const MASTERCARD_DISCOUNT_MONTHS = 3;

export function MastercardLogo({ className = '' }: { className?: string }) {
  return (
    <span
      className={'relative inline-flex items-center ' + className}
      aria-label="Mastercard"
      role="img"
    >
      <span className="block w-5 h-5 rounded-full bg-[#EB001B]" />
      <span className="block w-5 h-5 rounded-full bg-[#F79E1B] -ml-2 mix-blend-multiply" />
    </span>
  );
}

function money(n: number, currency: string) {
  return `${n.toFixed(2).replace('.', ',')} ${currency}`;
}

interface PromoProps {
  price: number;
  currency?: string;
}

// Full PDP block: shows the discounted price and the savings math.
export function MastercardPdpPromo({ price, currency = '€' }: PromoProps) {
  const discounted = price * (1 - MASTERCARD_DISCOUNT_PCT / 100);
  const monthlySaving = price - discounted;
  const totalSaving = monthlySaving * MASTERCARD_DISCOUNT_MONTHS;

  return (
    <div className="mt-5 rounded-xl border border-[#f0b000]/50 bg-gradient-to-br from-[#fff8e6] to-white p-4 dark:from-slate-700/60 dark:to-slate-800 dark:border-amber-500/30">
      <div className="flex items-center gap-2">
        <MastercardLogo />
        <span className="text-sm font-bold text-[#062f66] dark:text-amber-300">
          Pay with Mastercard, save {MASTERCARD_DISCOUNT_PCT}%
        </span>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[#062f66] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          <Tag className="w-3 h-3" /> Exclusive
        </span>
      </div>

      <div className="mt-3 flex items-end gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-slate-400">
            First {MASTERCARD_DISCOUNT_MONTHS} months
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-extrabold text-[#1a8c45] dark:text-emerald-400">
              {money(discounted, currency)}
            </span>
            <span className="text-sm text-gray-400 line-through mb-0.5 dark:text-slate-500">
              {money(price, currency)}
            </span>
            <span className="text-xs text-gray-500 mb-1 dark:text-slate-400">/mo</span>
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-slate-400">You save</div>
          <div className="text-lg font-bold text-[#062f66] dark:text-amber-300">
            {money(totalSaving, currency)}
          </div>
        </div>
      </div>

      <p className="mt-3 flex items-start gap-1.5 text-[11px] text-gray-600 dark:text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-[#f0b000] mt-px shrink-0" />
        Applied automatically at checkout when you pay with an eligible Mastercard. Stacks with
        bundle savings · unlocks Priceless&nbsp;extras.{' '}
        <Link to="/blog/pay-with-mastercard-save-more" className="text-[#0a4ea8] underline dark:text-blue-400">
          How it works
        </Link>
      </p>
    </div>
  );
}

// Compact homepage strip.
export function MastercardStrip() {
  return (
    <Link
      to="/blog/pay-with-mastercard-save-more"
      className="group my-10 flex flex-col sm:flex-row items-center gap-4 rounded-2xl bg-gradient-to-r from-[#062f66] via-[#0a4ea8] to-[#062f66] p-5 md:p-6 text-white overflow-hidden relative"
    >
      <div className="absolute -right-6 -bottom-8 opacity-20 scale-[3] hidden sm:block">
        <MastercardLogo />
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="grid place-items-center h-12 w-16 rounded-lg bg-white/95">
          <MastercardLogo />
        </span>
      </div>
      <div className="flex-1 text-center sm:text-left relative">
        <div className="text-lg md:text-xl font-bold">
          Pay with Mastercard and save {MASTERCARD_DISCOUNT_PCT}% for {MASTERCARD_DISCOUNT_MONTHS} months
        </div>
        <div className="text-sm text-white/80">
          Automatic at checkout on any plan or bundle · stacks with bundle savings · Priceless extras included.
        </div>
      </div>
      <span className="relative shrink-0 inline-flex items-center gap-1.5 rounded-full bg-[#ffc857] px-4 py-2 text-sm font-bold text-[#062f66] group-hover:bg-white transition">
        See the offer
      </span>
    </Link>
  );
}
