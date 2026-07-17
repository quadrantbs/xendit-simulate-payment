// Cloudflare Worker entry point.
// Serves static assets and proxies /api/simulate-payment to Xendit to avoid browser CORS.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/simulate-payment' && request.method === 'POST') {
      const authorization = request.headers.get('Authorization');
      const { external_id, amount } = await request.json();

      const xenditRes = await fetch(
        `https://api.xendit.co/callback_virtual_accounts/external_id=${encodeURIComponent(external_id)}/simulate_payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: authorization,
          },
          body: JSON.stringify({ amount }),
        }
      );

      const text = await xenditRes.text();
      return new Response(text, {
        status: xenditRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
