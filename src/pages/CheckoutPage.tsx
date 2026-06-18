import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, ShieldCheck } from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useConfig } from '../context/ConfigContext';
import { trackEvent } from '../utils/dyEvents';

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postcode: string;
  iban: string;
  consent: boolean;
}

export default function CheckoutPage() {
  const { lines, monthlyTotal, count, clear } = useCart();
  const { config } = useConfig();
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [orderId, setOrderId] = useState('');
  const [form, setForm] = useState<CheckoutForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postcode: '',
    iban: '',
    consent: false,
  });

  const update = <K extends keyof CheckoutForm>(k: K, v: CheckoutForm[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent) return;
    const id = `NP-${Date.now().toString(36).toUpperCase()}`;
    setOrderId(id);

    // [DY INTEGRATION] Standard purchase event with the cart payload so DY
    // attributes the conversion to the correct campaign and updates KPIs.
    trackEvent('Purchase', {
      uniqueTransactionId: id,
      cart: lines.map((l) => ({
        productId: l.sku,
        quantity: l.quantity,
        itemPrice: l.price,
      })),
      value: monthlyTotal,
      currency: 'EUR',
    });

    clear();
    setStep('success');
  };

  if (lines.length === 0 && step === 'form') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2 dark:text-slate-100">Your cart is empty</h1>
        <p className="text-sm text-gray-600 mb-5 dark:text-slate-400">
          Add a plan to your cart before checkout.
        </p>
        <Link to="/" className="btn-primary inline-flex">Browse plans</Link>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="grid place-items-center w-16 h-16 mx-auto rounded-full bg-[#e9f7ed] dark:bg-emerald-900/40">
          <Check className="w-8 h-8 text-[#1a8c45]" />
        </div>
        <h1 className="mt-4 text-2xl md:text-3xl font-bold text-[#062f66] dark:text-slate-100">
          Welcome to NovaPower!
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
          Your order <strong>{orderId}</strong> has been placed. We'll handle the switch with
          your previous provider — no service interruption. A confirmation email is on its
          way to <strong>{form.email || 'your inbox'}</strong>.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/account')}
            className="btn-primary"
          >
            Go to my account
          </button>
          <Link to="/" className="btn-secondary">Back to home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      <Link to="/cart" className="text-xs text-[#0a4ea8] inline-flex items-center gap-1 mb-3 hover:underline dark:text-blue-400">
        <ChevronLeft className="w-3 h-3" /> Back to cart
      </Link>
      <h1 className="text-2xl md:text-3xl font-bold text-[#062f66] mb-6 dark:text-slate-100">Checkout</h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Form */}
        <form onSubmit={onSubmit} className="bg-white rounded-xl border border-gray-200 p-5 space-y-5 dark:bg-slate-800 dark:border-slate-700">
          <Section title="Contact details">
            <Field label="First name">
              <input
                required
                className="input-field"
                value={form.firstName}
                onChange={(e) => update('firstName', e.target.value)}
              />
            </Field>
            <Field label="Last name">
              <input
                required
                className="input-field"
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
              />
            </Field>
            <Field label="Email">
              <input
                required
                type="email"
                className="input-field"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </Field>
            <Field label="Phone">
              <input
                required
                type="tel"
                className="input-field"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Service address">
            <Field label="Street address" wide>
              <input
                required
                className="input-field"
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
              />
            </Field>
            <Field label="City">
              <input
                required
                className="input-field"
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
              />
            </Field>
            <Field label="Postcode">
              <input
                required
                className="input-field"
                value={form.postcode}
                onChange={(e) => update('postcode', e.target.value)}
              />
            </Field>
          </Section>

          <Section title="Payment">
            <Field label="IBAN (direct debit)" wide>
              <input
                required
                placeholder="ES00 0000 0000 0000 0000 0000"
                className="input-field"
                value={form.iban}
                onChange={(e) => update('iban', e.target.value)}
              />
              <p className="mt-1 text-[11px] text-gray-500 dark:text-slate-400">
                Your bank details are encrypted and never stored on our servers.
              </p>
            </Field>
          </Section>

          <label className="flex items-start gap-2 text-sm dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(e) => update('consent', e.target.checked)}
              className="mt-0.5"
            />
            <span className="text-gray-700 dark:text-slate-300">
              I authorize NovaPower to manage the switch with my previous provider and accept
              the <a className="text-[#0a4ea8] underline">terms of service</a>.
            </span>
          </label>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={!form.consent}
          >
            <ShieldCheck className="w-4 h-4" /> Place order
          </button>
          <p className="text-[11px] text-gray-500 text-center dark:text-slate-400">
            You won't be charged until your service is activated.
          </p>
        </form>

        {/* Summary */}
        <aside className="lg:sticky lg:top-20 self-start">
          <div className="bg-white rounded-xl border border-gray-200 p-5 dark:bg-slate-800 dark:border-slate-700">
            <h2 className="font-semibold text-[#062f66] dark:text-slate-100">Order summary</h2>
            <ul className="mt-3 space-y-3">
              {lines.map((l) => (
                <li key={l.sku} className="flex gap-3 text-sm">
                  {l.image_url && (
                    <img
                      src={l.image_url}
                      alt=""
                      className="w-12 h-12 rounded object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium leading-tight line-clamp-2 dark:text-slate-100">{l.name}</div>
                    <div className="text-[11px] text-gray-500 dark:text-slate-400">
                      Qty {l.quantity} · {l.contract_length}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold">
                      {(l.price * l.quantity).toFixed(2).replace('.', ',')} {config.currency}
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-slate-400">/ mo</div>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-sm dark:border-slate-700">
              <div className="flex justify-between">
                <dt>Items</dt>
                <dd>{count}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Setup fees</dt>
                <dd className="text-[#1a8c45] font-semibold">FREE</dd>
              </div>
              <div className="flex justify-between font-semibold border-t border-gray-100 pt-2 dark:border-slate-700">
                <dt>Monthly total</dt>
                <dd className="text-[#062f66] dark:text-blue-300">
                  {monthlyTotal.toFixed(2).replace('.', ',')} {config.currency}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      <style>{`
        .input-field {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          background: #fff;
          color: #0c1b2a;
        }
        .input-field:focus { outline: 2px solid rgba(10,78,168,0.3); border-color: #0a4ea8; }
        .dark .input-field {
          background: #334155;
          border-color: #475569;
          color: #f1f5f9;
        }
        .dark .input-field::placeholder { color: #94a3b8; }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-[#062f66] mb-3 uppercase tracking-wide dark:text-slate-100">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={'block ' + (wide ? 'sm:col-span-2' : '')}>
      <span className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-slate-400">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
