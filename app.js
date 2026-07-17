// Simple curl generator for Xendit FVA
const curlForm = document.getElementById('curlForm');
const apiKeyEl = document.getElementById('apiKey');
const externalIdEl = document.getElementById('externalId');
const amountEl = document.getElementById('amount');
const curlOutput = document.getElementById('curlOutput');
const copyBtn = document.getElementById('copyCurl');

const DEFAULT_BANK = 'BNI';
const XENDIT_FVA_ENDPOINT = 'https://api.xendit.co/v2/callback_virtual_accounts';

function buildCurl(apiKey, externalId, amount, bank = DEFAULT_BANK) {
  const body = {
    external_id: externalId,
    bank_code: bank,
    expected_amount: Number(amount),
  };

  // Use -u "APIKEY:" for basic auth (API key as username)
  const safeBody = JSON.stringify(body).replace(/'/g, "'\\''");

  return `curl -X POST "${XENDIT_FVA_ENDPOINT}" -u "${apiKey}:" -H "Content-Type: application/json" -d '${safeBody}'`;
}

curlForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const apiKey = apiKeyEl.value.trim();
  const externalId = externalIdEl.value.trim();
  const amount = amountEl.value.trim();

  if (!apiKey || !externalId || !amount) {
    curlOutput.textContent = 'Isi semua field: API Key, External ID, Amount';
    return;
  }

  const cmd = buildCurl(apiKey, externalId, amount);
  curlOutput.textContent = cmd;
});

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(curlOutput.textContent);
    copyBtn.textContent = 'Copied';
    setTimeout(() => (copyBtn.textContent = 'Copy'), 1200);
  } catch (err) {
    console.error(err);
    copyBtn.textContent = 'Copy failed';
    setTimeout(() => (copyBtn.textContent = 'Copy'), 1200);
  }
});
