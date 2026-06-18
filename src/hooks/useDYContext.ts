import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { setDYContext } from '../utils/dyEvents';
import { useCart } from '../context/CartContext';

// [DY INTEGRATION] Page-context detector. On every SPA route change, this
// hook computes the correct DY page-type / page-data tuple and pushes it to
// `window.DY.recommendationContext` so DY's loader and recs widgets pick up
// the right context.
//
// Mapping:
//   /                  → HOMEPAGE
//   /plans/:category   → CATEGORY    data: ["Electricity"]
//   /plan/:sku         → PRODUCT     data: ["ELEC-GREEN-100"]
//   /cart              → CART        data: skus in cart
//   /checkout          → OTHER       data: ["checkout"]
//   /account           → OTHER       data: ["account"]
//   /search            → OTHER       data: ["search-results"]

export function useDYContext() {
  const location = useLocation();
  const params = useParams();
  const { lines } = useCart();

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setDYContext('HOMEPAGE', []);
    } else if (path.startsWith('/plans/')) {
      const category = decodeURIComponent(path.split('/')[2] ?? '');
      setDYContext('CATEGORY', category ? [humanize(category)] : []);
    } else if (path.startsWith('/plan/')) {
      const sku = params.sku ?? path.split('/')[2] ?? '';
      setDYContext('PRODUCT', sku ? [sku] : []);
    } else if (path === '/cart') {
      setDYContext('CART', lines.map((l) => l.sku));
    } else if (path === '/checkout') {
      setDYContext('OTHER', ['checkout']);
    } else if (path === '/account') {
      setDYContext('OTHER', ['account']);
    } else if (path === '/blog') {
      setDYContext('OTHER', ['blog']);
    } else if (path.startsWith('/blog/')) {
      const slug = decodeURIComponent(path.split('/')[2] ?? '');
      setDYContext('OTHER', slug ? ['blog-post', slug] : ['blog-post']);
    } else if (path === '/search') {
      setDYContext('OTHER', ['search-results']);
    } else {
      setDYContext('OTHER', [path]);
    }
  }, [location.pathname, params.sku, lines]);
}

function humanize(s: string) {
  return s
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
