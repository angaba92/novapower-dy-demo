import { Leaf, Mail, MapPin, Phone, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-16 bg-[#062f66] text-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="grid place-items-center h-9 w-9 rounded-lg bg-white/10">
              <Zap className="w-5 h-5 text-[#ffc857]" />
            </span>
            <span className="font-bold text-lg">NovaPower</span>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            Energy, broadband and mobile — built around your home, made for the next decade.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 text-sm text-[#7be0a3]">
            <Leaf className="w-4 h-4" />
            B-Corp certified · 100% renewable origin
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-4 uppercase tracking-wide text-white/80">Plans</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/plans/electricity" className="hover:text-white">Electricity</Link></li>
            <li><Link to="/plans/gas" className="hover:text-white">Gas</Link></li>
            <li><Link to="/plans/broadband" className="hover:text-white">Broadband</Link></li>
            <li><Link to="/plans/mobile" className="hover:text-white">Mobile</Link></li>
            <li><Link to="/plans/bundles" className="hover:text-white">Bundles</Link></li>
            <li><Link to="/plans/smart-home" className="hover:text-white">Smart Home</Link></li>
            <li><Link to="/plans/insurance" className="hover:text-white">Insurance</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-4 uppercase tracking-wide text-white/80">Company</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/blog" className="hover:text-white">Insights &amp; blog</Link></li>
            <li><Link to="/blog/pay-with-mastercard-save-more" className="hover:text-white">Mastercard offer</Link></li>
            <li><a href="#" className="hover:text-white">Our green commitment</a></li>
            <li><a href="#" className="hover:text-white">Calculate your savings</a></li>
            <li><a href="#" className="hover:text-white">Help center</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-4 uppercase tracking-wide text-white/80">Contact</h4>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-2"><Phone className="w-4 h-4 mt-0.5" /> 900 NOVA POWER (free)</li>
            <li className="flex items-start gap-2"><Mail className="w-4 h-4 mt-0.5" /> hello@novapower.demo</li>
            <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5" /> Calle del Viento 21<br />28010 Madrid, Spain</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 text-xs text-white/60 flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} NovaPower SA — Demo site for Dynamic Yield (by Mastercard).</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Cookies</a>
            <a href="#" className="hover:text-white">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
