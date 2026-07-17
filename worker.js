// Cloudflare Worker entry point.
// Serves static assets and proxies arbitrary requests to api.xendit.co
// via POST /api/proxy, to avoid browser CORS. Only api.xendit.co is allowed
// as a target to prevent this from becoming an open proxy.
const ALLOWED_HOST = 'api.xendit.co';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/proxy' && request.method === 'POST') {
      const { method, url: targetUrl, headers, body } = await request.json();

      let target;
      try {
        target = new URL(targetUrl);
      } catch (e) {
        return jsonResponse({ error: 'Invalid target URL' }, 400);
      }

      if (target.hostname !== ALLOWED_HOST) {
        return jsonResponse({ error: `Only requests to ${ALLOWED_HOST} are allowed` }, 400);
      }

      const upstreamRes = await fetch(target.toString(), {
        method: method || 'GET',
        headers: headers || {},
        body: method && method !== 'GET' && body !== undefined ? JSON.stringify(body) : undefined,
      });

      const text = await upstreamRes.text();
      return jsonResponse(
        { status: upstreamRes.status, statusText: upstreamRes.statusText, body: text },
        200
      );
    }

    return env.ASSETS.fetch(request);
  },
};

function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
