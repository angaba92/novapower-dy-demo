// [DY INTEGRATION] Lightweight client-side wrapper for DY event tracking.
// In production this would call `window.DY.API('event', { name, properties })`
// directly via the DY context script. For the demo we POST to /api/dy-event,
// which forwards to https://dy-api.com/v2/collect/user/event.
//
// Standard DY event names supported by the platform:
//   - "Add to Cart"
//   - "Remove from Cart"
//   - "Purchase"
//   - "Newsletter Subscription"
//   - "Sign Up"
//   - "Login"
//   - "Identify Users"
//   - "Promo Code Applied"
//   - any custom event you defined in the DY console

export async function trackEvent(
  name: string,
  properties: Record<string, unknown> = {},
): Promise<void> {
  // Prefer the official DY in-page API when present (production deploy).
  const dy = (window as any).DY;
  if (dy?.API && typeof dy.API === 'function') {
    try {
      dy.API('event', { name, properties });
      return;
    } catch {
      /* fall through to proxy */
    }
  }

  // Fallback: proxy through the server (works in the demo without the DY loader).
  try {
    await fetch('/api/dy-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        properties,
        pageLocation: window.location.href,
        userAgent: navigator.userAgent,
      }),
    });
  } catch (e) {
    console.warn('[DY Event] Failed to track:', name, e);
  }
}

// [DY INTEGRATION] Updates window.DY.recommendationContext for the current
// page and notifies the DY loader of the SPA navigation. The DY context script
// reads `recommendationContext` to decide which campaigns / experiences to
// evaluate. Standard page types:
//   - HOMEPAGE
//   - CATEGORY (data: array of category names)
//   - PRODUCT  (data: [sku])
//   - CART     (data: array of skus in cart)
//   - OTHER    (data: arbitrary identifiers)
export function setDYContext(type: string, data: string[] = []): void {
  const w = window as any;
  w.DY = w.DY || {};
  w.DY.recommendationContext = { type, data };

  // Notify DY's in-page API that an SPA navigation happened so the new context
  // is evaluated and counted as a fresh pageview (native client-side flow).
  if (w.DY.API && typeof w.DY.API === 'function') {
    try {
      w.DY.API('spa', {
        context: { type, data },
        url: window.location.href,
        countAsPageview: true,
      });
    } catch {
      /* ignore */
    }
  }
}
