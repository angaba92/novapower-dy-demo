// [DY INTEGRATION] Server-side proxy for Dynamic Yield Shopping Muse
// (Agent Assistant). Receives a chat message from the NovaPower UI and
// forwards it to DY with NovaPower-specific context (page type, locale,
// device). The DY API key is held server-side only.
//
// Docs: https://dy.dev/docs/agent-assistant
interface ShoppingMuseRequestBody {
  text?: string;
  chatId?: string;
  locale?: string;
  pageLocation?: string;
  userAgent?: string;
  pageType?: string;
  pageData?: string[];
}

interface ShoppingMuseApiResponse {
  choices?: Array<{
    variations?: Array<{
      payload?: {
        data?: {
          assistant?: string;
          chatId?: string;
          support?: boolean;
          widgets?: Array<{
            title?: string;
            slots?: Array<{
              slotId?: string;
              sku?: string;
              productData?: Record<string, unknown>;
            }>;
          }> | null;
        };
      };
    }>;
  }>;
  warnings?: Array<{ code?: string; message?: string }>;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = (req.body ?? {}) as ShoppingMuseRequestBody;
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  const chatId = typeof body.chatId === 'string' ? body.chatId.trim() : '';
  const locale = typeof body.locale === 'string' && body.locale.trim() ? body.locale.trim() : 'en_US';
  const pageLocation = typeof body.pageLocation === 'string' && body.pageLocation.trim()
    ? body.pageLocation.trim()
    : 'https://novapower.demo';
  const userAgent = typeof body.userAgent === 'string' && body.userAgent.trim()
    ? body.userAgent.trim()
    : 'Mozilla/5.0';
  const pageType = typeof body.pageType === 'string' && body.pageType.trim() ? body.pageType.trim() : 'HOMEPAGE';
  const pageData = Array.isArray(body.pageData) ? body.pageData : ['novapower-home'];
  const deviceType = /Mobi|Android|iPhone|iPad|iPod/i.test(userAgent) ? 'MOBILE' : 'DESKTOP';

  if (!text) return res.status(400).json({ error: 'text is required' });
  if (text.length > 250) return res.status(400).json({ error: 'text must be 250 characters or fewer' });

  const apiKey = '8841a064d25730a814fb35c575072585fc631088846b79cd7d5d18d020337725';

  // Dummy values for Muse identity/session fields. In a real deployment these
  // come from the DY context script (window.DY.recommendationContext + cookie
  // _dyid / _dyjsession).
  const dummyDyid = '123';
  const dummySessionDy = 'ohyr6v42l9zd4bpinnvp7urjjx9lrssw';

  const payload: Record<string, unknown> = {
    user: { active_consent_accepted: true, dyid: dummyDyid, dyid_server: dummyDyid },
    session: { dy: dummySessionDy },
    query: { ...(chatId ? { chatId } : {}), text },
    context: {
      page: { type: pageType, data: pageData, location: pageLocation, locale },
      device: { userAgent, type: deviceType },
    },
    selector: { name: 'NovaPower Assistant' },
    options: {
      returnAnalyticsMetadata: false,
      isImplicitClientData: false,
      isImplicitKeywordSearchEvent: false,
    },
  };

  try {
    const response = await fetch('https://dy-api.com/v2/serve/user/agent-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'dy-api-key': apiKey },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const details = await response.text();
      console.error('[Shopping Muse] API error:', response.status, details);
      return res.status(response.status).json({
        error: 'Shopping Muse request failed',
        message: details || `Remote status ${response.status}`,
        details,
      });
    }

    const data = (await response.json()) as ShoppingMuseApiResponse;
    const museData = data.choices?.[0]?.variations?.[0]?.payload?.data;

    return res.status(200).json({
      assistant: museData?.assistant ?? '',
      chatId: museData?.chatId ?? null,
      support: Boolean(museData?.support),
      widgets: museData?.widgets ?? [],
      warnings: data.warnings ?? [],
      rawResponse: data,
    });
  } catch (error) {
    console.error('[Shopping Muse] Proxy error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
