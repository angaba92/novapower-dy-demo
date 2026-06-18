import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, LogIn, Mail, ShieldCheck, Sparkles } from 'lucide-react';

import { DEMO_CREDENTIALS, useAuth } from '../context/AuthContext';

// Login gate for the NovaPower private area. Credentials are pre-filled so the
// demo can be entered with a single click.
export default function PrivateAreaLogin() {
  const { login } = useAuth();
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(email, password);
    if (!res.ok) setError(res.error ?? 'Login failed');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-10">
      <div className="grid md:grid-cols-2 rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm dark:bg-slate-800 dark:border-slate-700">
        {/* Marketing side */}
        <div className="relative hidden md:flex flex-col justify-between p-8 text-white gradient-hero">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-white/80">
              My NovaPower
            </p>
            <h2 className="mt-2 text-2xl font-bold leading-snug">
              Your private area — everything in one place
            </h2>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 mt-0.5 text-[#7be0a3]" />
                Track real-time consumption and bills
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 mt-0.5 text-[#7be0a3]" />
                Manage every contracted plan from one dashboard
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 mt-0.5 text-[#7be0a3]" />
                Get tailored upgrades that save you money
              </li>
            </ul>
          </div>
          <p className="text-xs text-white/70">
            Switching is simple: sign up online in 5 minutes, no paperwork.
          </p>
        </div>

        {/* Form side */}
        <div className="p-8">
          <div className="flex items-center gap-2 mb-1">
            <span className="grid place-items-center h-9 w-9 rounded-lg gradient-hero text-white">
              <Lock className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold text-[#062f66] dark:text-slate-100">Log in</h1>
          </div>
          <p className="text-sm text-gray-600 mb-5 dark:text-slate-400">
            Access your private area to manage plans and usage.
          </p>

          <div className="mb-4 flex items-start gap-2 rounded-lg bg-[#fff8e6] border border-[#f0b000]/40 p-3 text-xs text-[#7a5a00] dark:bg-amber-900/20 dark:border-amber-500/30 dark:text-amber-300">
            <Sparkles className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Demo credentials are pre-filled — just press <strong>Enter the private area</strong>.
            </span>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-slate-400">Email</span>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a4ea8]/30 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-slate-400">Password</span>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a4ea8]/30 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                />
              </div>
            </label>

            {error && <p className="text-xs text-[#cc0000]">{error}</p>}

            <button type="submit" className="btn-primary w-full">
              <LogIn className="w-4 h-4" /> Enter the private area
            </button>
          </form>

          <p className="mt-4 text-xs text-gray-500 text-center dark:text-slate-400">
            Not a customer yet?{' '}
            <Link to="/plans/bundles" className="text-[#0a4ea8] font-semibold hover:underline dark:text-blue-400">
              Compare plans
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
