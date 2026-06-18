// [DY INTEGRATION] Server-side proxy for Dynamic Yield "Choose" — fetches
// experience variations and recommendation widgets. The NovaPower site uses
// this for:
//   - Personalized hero banner on the homepage
//   - "Recommended for you" / "Bundle & save" widgets on PDP and Cart
//   - Cross-sell add-on recommendations on the cart
//
// Docs: https://dy.dev/docs/choose-variations
//       https://dy.dev/reference/choose

interface ChooseRequestBody {
  selectorNames?: string[];     // e.g. ["NovaPower Homepage Hero", "Recommended Plans"]
  selectorGroups?: string[];
  pageType?: string;            // HOMEPAGE | CATEGORY | PRODUCT | CART | OTHER
  pageData?: string[];          // category names for CATEGORY, sku list for PRODUCT/CART
  pageLocation?: string;
  locale?: string;
  userAgent?: string;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = (req.body ?? {}) as ChooseRequestBody;
  const apiKey = (globalThis as any).process?.env?.SHOPPINGMUSE_API_KEY as string | undefined
    ?? '82da6ade9f6ed5075eba88afc6157342af35bf1e2ce5698824372b2e883e6f8f';

  // For pure demo purposes (no live DY key for the NovaPower section), return
  // a deterministic mock response so the UI remains populated. In production
  // remove this branch and require the API key.
  if (!apiKey) {
    return res.status(200).json({
      mocked: true,
      choices: [
        {
          name: body.selectorNames?.[0] || 'NovaPower Hero',
          variations: [{ payload: { data: { fallback: true } } }],
        },
      ],
    });
  }

  const userAgent = body.userAgent || 'Mozilla/5.0';
  const deviceType = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent) ? 'MOBILE' : 'DESKTOP';

  const payload = {
    user: { active_consent_accepted: true, dyid: '123', dyid_server: '123' },
    session: { dy: 'ohyr6v42l9zd4bpinnvp7urjjx9lrssw' },
    selector: {
      names: body.selectorNames ?? [],
      groups: body.selectorGroups ?? [],
    },
    context: {
      page: {
        type: body.pageType || 'HOMEPAGE',
        data: body.pageData ?? [],
        location: body.pageLocation || 'https://novapower.demo',
        locale: body.locale || 'en_US',
      },
      device: { userAgent, type: deviceType },
    },
    options: { returnAnalyticsMetadata: false, isImplicitPageview: false },
  };

  try {
    const response = await fetch('https://dy-api.com/v2/serve/user/choose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'dy-api-key': apiKey },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: 'Choose request failed', details: text });
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('[DY Choose] Proxy error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
