import { Link } from 'react-router-dom';
import {
  Apple,
  BellRing,
  CreditCard,
  Gauge,
  Play,
  Smartphone,
  Sparkles,
  Star,
} from 'lucide-react';

// App-download banner inspired by pepeenergy/iberdrola: highlights "procesos
// sencillos" (manage everything from the app) next to a CSS phone mockup and
// app-store badges. Pure presentational — no external assets required.

const STEPS = [
  { icon: Gauge, label: 'Track usage', text: 'See real-time consumption and costs.' },
  { icon: CreditCard, label: 'Pay in a tap', text: 'Manage bills and Mastercard rewards.' },
  { icon: BellRing, label: 'Smart alerts', text: 'Get notified before you overspend.' },
];

export default function AppPromoBanner() {
  return (
    <section className="my-12 rounded-2xl overflow-hidden bg-gradient-to-br from-[#062f66] via-[#0a4ea8] to-[#0a4ea8] text-white">
      <div className="grid lg:grid-cols-2 gap-8 items-center p-6 md:p-10">
        {/* Copy + steps */}
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#ffc857]">
            <Sparkles className="w-4 h-4" /> NovaPower App
          </div>
          <h2 className="mt-2 text-2xl md:text-3xl font-bold leading-tight">
            Manage everything from your pocket
          </h2>
          <p className="mt-3 text-sm md:text-base text-white/80 max-w-md">
            Procesos sencillos: control your energy, broadband and mobile in one app. Switch,
            top up and track consumption in minutes — no paperwork, no queues.
          </p>

          <ul className="mt-6 space-y-3">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.label} className="flex items-start gap-3">
                  <span className="grid place-items-center w-9 h-9 rounded-lg bg-white/15 shrink-0">
                    <Icon className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{s.label}</div>
                    <div className="text-xs text-white/70">{s.text}</div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Store badges */}
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#app-store"
              aria-label="Download on the App Store"
              className="inline-flex items-center gap-2 rounded-xl bg-black/70 hover:bg-black px-4 py-2.5 transition"
            >
              <Apple className="w-6 h-6" />
              <span className="leading-tight text-left">
                <span className="block text-[10px] text-white/70">Download on the</span>
                <span className="block text-sm font-semibold">App Store</span>
              </span>
            </a>
            <a
              href="#google-play"
              aria-label="Get it on Google Play"
              className="inline-flex items-center gap-2 rounded-xl bg-black/70 hover:bg-black px-4 py-2.5 transition"
            >
              <Play className="w-5 h-5 fill-current" />
              <span className="leading-tight text-left">
                <span className="block text-[10px] text-white/70">Get it on</span>
                <span className="block text-sm font-semibold">Google Play</span>
              </span>
            </a>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-white/70">
            <Star className="w-3.5 h-3.5 fill-[#ffc857] text-[#ffc857]" />
            <span className="font-semibold text-white">4.8</span> · 12,400+ reviews
          </div>
        </div>

        {/* Phone mockup */}
        <div className="relative hidden lg:flex justify-center">
          <div className="relative w-56 h-[420px] rounded-[2.2rem] bg-slate-900 border-[6px] border-slate-800 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-slate-800 rounded-b-2xl z-10" />
            <div className="h-full w-full bg-gradient-to-b from-[#f5faff] to-white p-3 pt-7">
              <div className="flex items-center gap-2">
                <span className="grid place-items-center w-8 h-8 rounded-lg gradient-hero text-white">
                  <Smartphone className="w-4 h-4" />
                </span>
                <div>
                  <div className="text-[10px] text-gray-400 leading-none">Good morning</div>
                  <div className="text-xs font-bold text-[#062f66] leading-tight">María</div>
                </div>
              </div>

              <div className="mt-3 rounded-xl gradient-hero text-white p-3">
                <div className="text-[10px] text-white/70">This month</div>
                <div className="text-xl font-extrabold">84,90 €</div>
                <div className="text-[10px] text-[#7be0a3]">15% below average</div>
              </div>

              <div className="mt-3 space-y-2">
                {['Electricity', 'Fiber 600', 'Mobile 25GB'].map((p, i) => (
                  <div
                    key={p}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-2.5 py-2 border border-gray-100"
                  >
                    <span className="text-[11px] font-semibold text-[#062f66]">{p}</span>
                    <span className="text-[10px] text-[#1a8c45] font-semibold">
                      {['Active', 'Active', '12GB left'][i]}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-lg bg-[#fff8e6] border border-[#f0b000]/40 px-2.5 py-2">
                <div className="text-[10px] font-bold text-[#7a5a00]">Mastercard reward</div>
                <div className="text-[9px] text-[#7a5a00]/80">10% off your next 3 bills</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 px-6 md:px-10 py-3 text-center text-xs text-white/70">
        Prefer the browser?{' '}
        <Link to="/account" className="font-semibold text-white hover:underline">
          Open your private area
        </Link>
      </div>
    </section>
  );
}
