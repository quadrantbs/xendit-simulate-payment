// Simulate payment on an existing Xendit Fixed Virtual Account.
const simulateForm = document.getElementById('simulateForm');
const apiKeyEl = document.getElementById('apiKey');
const externalIdEl = document.getElementById('externalId');
const amountEl = document.getElementById('amount');
const responseOutput = document.getElementById('responseOutput');
const submitBtn = simulateForm.querySelector('button[type="submit"]');

simulateForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const apiKey = apiKeyEl.value.trim();
  const externalId = externalIdEl.value.trim();
  const amount = amountEl.value.trim();

  if (!apiKey || !externalId || !amount) {
    responseOutput.textContent = 'Isi semua field: API Key, External ID, Amount';
    return;
  }

  responseOutput.textContent = 'Executing...';
  submitBtn.disabled = true;

  try {
    const res = await fetch('/api/simulate-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + btoa(apiKey + ':'),
      },
      body: JSON.stringify({
        external_id: externalId,
        amount: Number(amount),
      }),
    });

    const text = await res.text();
    let out;
    try {
      out = JSON.stringify(JSON.parse(text), null, 2);
    } catch (e) {
      out = text;
    }

    responseOutput.textContent = `HTTP ${res.status} ${res.statusText}\n\n${out}`;
  } catch (err) {
    console.error(err);
    responseOutput.textContent = `Request failed: ${err.message || err}.\n\nNote: Execute calls a local/serverless proxy at /api/simulate-payment to avoid CORS. Make sure you're running this via "node server.js" locally or the deployed Cloudflare Worker.`;
  } finally {
    submitBtn.disabled = false;
  }
});
