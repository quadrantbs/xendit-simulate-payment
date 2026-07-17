// Cloudflare Pages Function — proxies FVA creation to Xendit to avoid browser CORS.
// Deployed automatically at /api/fva alongside the static site on Cloudflare Pages.
const XENDIT_FVA_ENDPOINT = 'https://api.xendit.co/v2/callback_virtual_accounts';

export async function onRequestPost(context) {
  const { request } = context;

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
