import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { Plan } from '../types';
import { trackEvent } from '../utils/dyEvents';

export interface CartLine {
  sku: string;
  name: string;
  price: number;          // monthly price in EUR
  image_url?: string;
  category: string;
  quantity: number;       // for add-ons (e.g. extra smart plugs); plans = 1
  contract_length?: string;
}

interface CartContextValue {
  lines: CartLine[];
  addPlan: (plan: Plan, quantity?: number) => void;
  removeLine: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clear: () => void;
  monthlyTotal: number;
  count: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'novapower_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines]);

  const addPlan = useCallback((plan: Plan, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.sku === plan.sku);
      if (existing) {
        return prev.map((l) =>
          l.sku === plan.sku ? { ...l, quantity: l.quantity + quantity } : l,
        );
      }
      return [
        ...prev,
        {
          sku: plan.sku,
          name: plan.name,
          price: plan.price,
          image_url: plan.image_url,
          category: plan.category_l1,
          quantity,
          contract_length: plan.contract_length,
        },
      ];
    });

    // [DY INTEGRATION] Send the standard Add-to-Cart event so DY can update
    // the visitor's affinity profile and trigger cart-abandonment campaigns.
    trackEvent('Add to Cart', {
      cart: [{ productId: plan.sku, quantity, itemPrice: plan.price }],
      value: plan.price * quantity,
      currency: 'EUR',
    });
  }, []);

  const removeLine = useCallback((sku: string) => {
    setLines((prev) => prev.filter((l) => l.sku !== sku));
  }, []);

  const updateQuantity = useCallback((sku: string, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.sku === sku ? { ...l, quantity: Math.max(1, quantity) } : l))
        .filter((l) => l.quantity > 0),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const monthlyTotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    [lines],
  );
  const count = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines],
  );

  return (
    <CartContext.Provider
      value={{ lines, addPlan, removeLine, updateQuantity, clear, monthlyTotal, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
