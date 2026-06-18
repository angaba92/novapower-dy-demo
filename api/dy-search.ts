// [DY INTEGRATION] Server-side proxy for Dynamic Yield Search.
// Mirrors api/dy-search.ts from sinsay_v2. The browser POSTs the full DY
// payload here; we strip the `region` and `sectionId` (used to choose the
// endpoint) and forward the rest to DY's search service.
//
// Docs:
//   https://dy.dev/docs/search
//   https://support.dynamicyield.com/hc/en-us/articles/360038581394-Product-Feed
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { region, sectionId, ...dyPayload } = req.body;

  const dyRegion = region || 'US';
  const dySectionId = '8795021'; // NovaPower demo section (hardcoded)
  const baseUrl = dyRegion === 'EU'
    ? 'https://recs-search-eu.dynamicyield.com/search/'
    : 'https://recs-search.dynamicyield.com/search/';

  try {
    const response = await fetch(`${baseUrl}${dySectionId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dyPayload),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('[DY Search] Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
