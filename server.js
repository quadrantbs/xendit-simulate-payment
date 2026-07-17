// Simple local proxy to bypass browser CORS when calling Xendit's API.
// Run: node server.js
// Then open http://localhost:8000 and use the Send button.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;
const ALLOWED_HOST = 'api.xendit.co';

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
};

function serveStatic(req, res) {
  const filePath = req.url === '/' ? '/index.html' : req.url;
  const fullPath = path.join(__dirname, filePath);

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(fullPath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

function sendJson(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

function proxyRequest(req, res) {
  let raw = '';
  req.on('data', (chunk) => (raw += chunk));
  req.on('end', async () => {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      sendJson(res, 400, { error: 'Invalid JSON in proxy request' });
      return;
    }

    const { method, url: targetUrl, headers, body } = parsed;

    let target;
    try {
      target = new URL(targetUrl);
    } catch (e) {
      sendJson(res, 400, { error: 'Invalid target URL' });
      return;
    }

    if (target.hostname !== ALLOWED_HOST) {
      sendJson(res, 400, { error: `Only requests to ${ALLOWED_HOST} are allowed` });
      return;
    }

    try {
      const upstreamRes = await fetch(target.toString(), {
        method: method || 'GET',
        headers: headers || {},
        body: method && method !== 'GET' && body !== undefined ? JSON.stringify(body) : undefined,
      });

      const text = await upstreamRes.text();
      sendJson(res, 200, { status: upstreamRes.status, statusText: upstreamRes.statusText, body: text });
    } catch (err) {
      sendJson(res, 502, { error: 'Proxy request failed', detail: err.message });
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/proxy') {
    proxyRequest(req, res);
    return;
  }
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
