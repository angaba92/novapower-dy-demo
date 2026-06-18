import { Check, MapPin, Search, X } from 'lucide-react';
import { useState } from 'react';
import { trackEvent } from '../utils/dyEvents';

// Telco-specific PDP component. Lets the visitor check if a fiber plan is
// available at their address. Triggers a DY event so the address (or
// city / postcode) becomes available as an audience signal.
export default function CoverageChecker({ planSku }: { planSku: string }) {
  const [postcode, setPostcode] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');

  const onCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postcode.trim()) return;
    setStatus('checking');

    // [DY INTEGRATION] Track the coverage-check event so DY can use it as
    // an audience signal (e.g. visitors who check for fiber but don't sign up).
    trackEvent('Coverage Check', {
      productId: planSku,
      postcode: postcode.trim(),
    });

    // Mock geo lookup — 9 in 10 postcodes return "available" in the demo.
    setTimeout(() => {
      const seed = Array.from(postcode).reduce((s, c) => s + c.charCodeAt(0), 0);
      setStatus(seed % 10 === 0 ? 'unavailable' : 'available');
    }, 600);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:bg-slate-800 dark:border-slate-700">
      <h3 className="font-semibold text-[#062f66] flex items-center gap-2 dark:text-slate-100">
        <MapPin className="w-4 h-4" />
        Check coverage at your address
      </h3>
      <form onSubmit={onCheck} className="mt-3 flex gap-2">
        <input
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          placeholder="Postcode (e.g. 28010)"
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a4ea8]/30 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-500"
        />
        <button type="submit" className="btn-primary py-2 text-sm">
          <Search className="w-4 h-4" />
          Check
        </button>
      </form>
      {status === 'checking' && (
        <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">Checking your address…</p>
      )}
      {status === 'available' && (
        <p className="mt-2 inline-flex items-center gap-1 text-sm text-[#1a8c45] font-medium">
          <Check className="w-4 h-4" /> Available at this address — installation in 5–7 days.
        </p>
      )}
      {status === 'unavailable' && (
        <p className="mt-2 inline-flex items-center gap-1 text-sm text-[#cc0000] font-medium">
          <X className="w-4 h-4" /> Not yet available — we'll email you when fiber reaches you.
        </p>
      )}
    </div>
  );
}
