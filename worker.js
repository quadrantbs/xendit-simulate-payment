// Cloudflare Worker entry point.
// Serves static assets and proxies /api/fva to Xendit to avoid browser CORS.
const XENDIT_FVA_ENDPOINT = 'https://api.xendit.co/v2/callback_virtual_accounts';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/fva' && request.method === 'POST') {
      const authorization = request.headers.get('Authorization');
      const body = await request.text();

      const xenditRes = await fetch(XENDIT_FVA_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authorization,
        },
        body,
      });

      const text = await xenditRes.text();
      return new Response(text, {
        status: xenditRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
