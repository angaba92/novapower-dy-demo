import { Users } from 'lucide-react';

interface SocialProofProps {
  count: number;
  /** Window in days, default 30 */
  days?: number;
  /** Override the verb, e.g. "added this device" */
  verb?: string;
}

// [DY INTEGRATION] Social-proof line. The number is supplied by the plan
// feed (`households_switched_30d`) but in production it's typically driven
// by a DY custom variable that's updated daily from a back-office report.
export default function SocialProof({ count, days = 30, verb = 'switched to this plan' }: SocialProofProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e9f7ed] text-[#1a8c45] text-xs font-medium">
      <Users className="w-3.5 h-3.5" />
      <span>
        <strong>{count.toLocaleString('en-US')}</strong> households {verb} in the last {days} days
      </span>
    </div>
  );
}
