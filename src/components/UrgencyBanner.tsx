import { Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface UrgencyBannerProps {
  /** ISO date — countdown target */
  endsAt?: string;
  /** Optional explicit copy override */
  message?: string;
}

// [DY INTEGRATION] Urgency banner. Replaces the retail "only 3 left in stock"
// pattern with the utilities/telco equivalent: "Lock in this rate before
// price increase" / "Offer ends in N days". The `endsAt` value can be driven
// by a DY custom variable so a campaign manager can extend or shorten the
// countdown without redeploying.
export default function UrgencyBanner({ endsAt, message }: UrgencyBannerProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!endsAt) return;
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, [endsAt]);

  let copy = message;
  if (!copy && endsAt) {
    const diffMs = new Date(endsAt).getTime() - now;
    if (diffMs <= 0) {
      copy = 'Last chance — offer ending now';
    } else {
      const days = Math.ceil(diffMs / 86_400_000);
      copy =
        days > 1
          ? `Offer ends in ${days} days — lock in this rate before the price increase.`
          : 'Offer ends today — lock in this rate before midnight.';
    }
  }
  if (!copy) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#ffc857]/60 bg-[#fff8e1] text-[#a37200] text-sm">
      <Clock className="w-4 h-4 shrink-0" />
      <span>{copy}</span>
    </div>
  );
}
