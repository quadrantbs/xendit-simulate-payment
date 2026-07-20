// Generic Xendit API tester — build any request (method/url/headers/auth/body)
// and send it through a same-origin proxy to avoid browser CORS.
const requestForm = document.getElementById('requestForm');
const methodEl = document.getElementById('method');
const urlEl = document.getElementById('url');
const authTypeEl = document.getElementById('authType');
const authValueEl = document.getElementById('authValue');
const bodyEl = document.getElementById('body');
const headersList = document.getElementById('headersList');
const addHeaderBtn = document.getElementById('addHeader');
const responseOutput = document.getElementById('responseOutput');
const responseMeta = document.getElementById('responseMeta');
const submitBtn = requestForm.querySelector('button[type="submit"]');

function addHeaderRow(key = '', value = '') {
  const row = document.createElement('div');
  row.className = 'kv-row';
  row.innerHTML = `
    <input type="text" class="header-key" placeholder="Header name" value="${key}" />
    <input type="text" class="header-value" placeholder="Header value" value="${value}" />
    <button type="button" class="btn action-btn danger">×</button>
  `;
  row.querySelector('button').addEventListener('click', () => row.remove());
  headersList.appendChild(row);
}

addHeaderRow('Content-Type', 'application/json');
addHeaderBtn.addEventListener('click', () => addHeaderRow());

function collectHeaders() {
  const headers = {};
  headersList.querySelectorAll('.kv-row').forEach((row) => {
    const key = row.querySelector('.header-key').value.trim();
    const value = row.querySelector('.header-value').value;
    if (key) headers[key] = value;
  });

  const authType = authTypeEl.value;
  const authValue = authValueEl.value.trim();
  if (authType === 'basic' && authValue) {
    headers['Authorization'] = 'Basic ' + btoa(authValue + ':');
  } else if (authType === 'bearer' && authValue) {
    headers['Authorization'] = 'Bearer ' + authValue;
  }

  return headers;
}

requestForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const method = methodEl.value;
  const url = urlEl.value.trim();
  const headers = collectHeaders();
  const bodyText = bodyEl.value.trim();

  if (!url) {
    responseOutput.textContent = 'Enter the request URL.';
    return;
  }

  let body;
  if (method !== 'GET' && bodyText) {
    try {
      body = JSON.parse(bodyText);
    } catch (err) {
      responseOutput.textContent = `Body bukan JSON valid: ${err.message}`;
      return;
    }
  }

  responseMeta.textContent = 'Executing...';
  responseOutput.textContent = 'Executing...';
  submitBtn.disabled = true;

  try {
    const res = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, url, headers, body }),
    });

    const text = await res.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      parsed = null;
    }

    if (parsed && typeof parsed.status !== 'undefined') {
      responseMeta.textContent = `HTTP ${parsed.status} ${parsed.statusText || ''}`.trim();
      let out = parsed.body;
      try {
        out = JSON.stringify(JSON.parse(parsed.body), null, 2);
      } catch (e) {
        // leave as raw text
      }
      responseOutput.textContent = out;
    } else {
      responseMeta.textContent = `HTTP ${res.status} ${res.statusText}`;
      responseOutput.textContent = text;
    }
  } catch (err) {
    console.error(err);
    responseMeta.textContent = 'Request failed';
    responseOutput.textContent = `Request failed: ${err.message || err}.\n\nNote: make sure the proxy is running (node server.js locally, or a Cloudflare Worker deployment).`;
  } finally {
    submitBtn.disabled = false;
  }
});
