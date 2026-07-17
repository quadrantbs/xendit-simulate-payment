// Simple local proxy to bypass browser CORS when calling Xendit's API.
// Run: node server.js
// Then open http://localhost:8000 and use the Execute button.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;

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

function proxySimulatePayment(req, res) {
  let body = '';
  req.on('data', (chunk) => (body += chunk));
  req.on('end', async () => {
    try {
      const { external_id, amount } = JSON.parse(body);
      const xenditRes = await fetch(
        `https://api.xendit.co/callback_virtual_accounts/external_id=${encodeURIComponent(external_id)}/simulate_payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: req.headers.authorization,
          },
          body: JSON.stringify({ amount }),
        }
      );
      const text = await xenditRes.text();
      res.writeHead(xenditRes.status, { 'Content-Type': 'application/json' });
      res.end(text);
    } catch (err) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Proxy request failed', detail: err.message }));
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/simulate-payment') {
    proxySimulatePayment(req, res);
    return;
  }
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
