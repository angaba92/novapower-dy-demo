// [DY INTEGRATION] Server-side proxy for Dynamic Yield event tracking.
// Mirrors the client-side `DY.API('event', …)` calls for purchases,
// add-to-cart, sign-ups etc. Used by the NovaPower checkout to record a
// purchase server-side.
//
// Docs: https://dy.dev/reference/post_collect-user-events

interface CollectEventBody {
  name: string;                       // e.g. "Add to Cart", "Purchase", "Newsletter Subscription"
  properties?: Record<string, unknown>;
  pageLocation?: string;
  userAgent?: string;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const body = (req.body ?? {}) as CollectEventBody;
  if (!body.name) return res.status(400).json({ error: 'event name is required' });

  const apiKey = (globalThis as any).process?.env?.SHOPPINGMUSE_API_KEY as string | undefined
    ?? '82da6ade9f6ed5075eba88afc6157342af35bf1e2ce5698824372b2e883e6f8f';

  // For the demo without a live key, just log and return success so the UI flow continues.
  if (!apiKey) {
    console.log('[DY Event] (mock)', body.name, body.properties);
    return res.status(200).json({ ok: true, mocked: true });
  }

  const payload = {
    user: { active_consent_accepted: true, dyid: '123', dyid_server: '123' },
    session: { dy: 'ohyr6v42l9zd4bpinnvp7urjjx9lrssw' },
    context: {
      page: { type: 'OTHER', location: body.pageLocation || 'https://novapower.demo' },
      device: { userAgent: body.userAgent || 'Mozilla/5.0' },
    },
    events: [{ name: body.name, properties: body.properties ?? {} }],
  };

  try {
    const response = await fetch('https://dy-api.com/v2/collect/user/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'dy-api-key': apiKey },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('[DY Event] Proxy error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
