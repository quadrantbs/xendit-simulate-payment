const storageKey = 'xendit-simulate-payment:v1';

const paymentForm = document.getElementById('paymentForm');
const paymentList = document.getElementById('paymentList');
const webhookPayload = document.getElementById('webhookPayload');
const resetBtn = document.getElementById('resetBtn');

const totalPaymentsEl = document.getElementById('totalPayments');
const paidPaymentsEl = document.getElementById('paidPayments');
const pendingPaymentsEl = document.getElementById('pendingPayments');
const totalAmountEl = document.getElementById('totalAmount');

const customerNameEl = document.getElementById('customerName');
const orderIdEl = document.getElementById('orderId');
const amountEl = document.getElementById('amount');
const vaBankEl = document.getElementById('vaBank');
const expiryMinutesEl = document.getElementById('expiryMinutes');

const currencyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

let payments = loadPayments();

seedDefaults();
render();

paymentForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const payment = createPayment({
    customerName: customerNameEl.value.trim(),
    orderId: orderIdEl.value.trim(),
    amount: Number(amountEl.value),
    channel: 'fva',
    vaBank: vaBankEl.value,
    expiryMinutes: Number(expiryMinutesEl.value),
  });

  payments = [payment, ...payments];
  savePayments();
  render();
  paymentForm.reset();
  amountEl.value = 150000;
  vaBankEl.value = 'bni';
  expiryMinutesEl.value = 60;
  customerNameEl.focus();
});

resetBtn.addEventListener('click', () => {
  localStorage.removeItem(storageKey);
  payments = loadPayments();
  seedDefaults();
  render();
});

function seedDefaults() {
  if (payments.length > 0) return;

  payments = [
    createPayment({
      customerName: 'Budi Santoso',
      orderId: 'ORD-1001',
      amount: 150000,
      channel: 'fva',
      vaBank: 'bni',
      expiryMinutes: 60,
      status: 'pending',
    }),
    createPayment({
      customerName: 'Siti Rahma',
      orderId: 'ORD-1002',
      amount: 99000,
      channel: 'qris',
      expiryMinutes: 30,
      status: 'paid',
    }),
  ];

  savePayments();
}

function createPayment({
  customerName,
  orderId,
  amount,
  channel,
  vaBank,
  expiryMinutes,
  status = 'pending',
}) {
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + expiryMinutes * 60 * 1000);
  const paymentId = `pay_${Math.random().toString(36).slice(2, 10)}`;
  const vaNumber = channel === 'fva' ? generateVaNumber(vaBank) : null;

  return {
    id: paymentId,
    customerName,
    externalId: orderId,
    orderId,
    amount,
    channel,
    vaBank: channel === 'fva' ? vaBank : null,
    vaNumber,
    status,
    createdAt: createdAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    invoiceUrl: `https://checkout.xendit.co/web/${paymentId}`,
  };
}

function updateStatus(id, status) {
  payments = payments.map((payment) =>
    payment.id === id ? { ...payment, status, updatedAt: new Date().toISOString() } : payment,
  );
  savePayments();
  render();
}

function savePayments() {
  localStorage.setItem(storageKey, JSON.stringify(payments));
}

function loadPayments() {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function render() {
  renderStats();
  renderPayments();
  renderWebhook();
}

function renderStats() {
  const total = payments.length;
  const paid = payments.filter((payment) => payment.status === 'paid').length;
  const pending = payments.filter((payment) => payment.status === 'pending').length;
  const amount = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  totalPaymentsEl.textContent = total.toString();
  paidPaymentsEl.textContent = paid.toString();
  pendingPaymentsEl.textContent = pending.toString();
  totalAmountEl.textContent = currencyFormatter.format(amount);
}

function renderPayments() {
  if (payments.length === 0) {
    paymentList.innerHTML = `
      <div class="payment-item">
        <p class="payment-title">Belum ada payment</p>
        <p class="payment-sub">Silakan create payment pertama dari form di sebelah kiri.</p>
      </div>
    `;
    return;
  }

  paymentList.innerHTML = payments
    .map(
      (payment) => `
        <article class="payment-item">
          <div class="payment-top">
            <div>
              <h3 class="payment-title">${escapeHtml(payment.externalId ?? payment.orderId)} · ${escapeHtml(payment.customerName)}</h3>
              <p class="payment-meta">${currencyFormatter.format(payment.amount)} · ${formatChannel(payment.channel)}</p>
              ${payment.vaNumber ? `<p class="payment-sub">VA ${escapeHtml(formatBank(payment.vaBank))}: ${escapeHtml(payment.vaNumber)}</p>` : ''}
              <p class="payment-sub">Invoice: ${escapeHtml(payment.invoiceUrl)}</p>
            </div>
            <span class="status-pill ${statusClass(payment.status)}">${payment.status}</span>
          </div>

          <p class="payment-sub">Created: ${formatDate(payment.createdAt)} · Expired: ${formatDate(payment.expiresAt)}</p>

          <div class="payment-actions">
            <button class="action-btn success" data-action="paid" data-id="${payment.id}">Mark Paid</button>
            <button class="action-btn danger" data-action="expired" data-id="${payment.id}">Expire</button>
            <button class="action-btn neutral" data-action="failed" data-id="${payment.id}">Fail</button>
          </div>
        </article>
      `,
    )
    .join('');

  paymentList.querySelectorAll('button[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      const { action, id } = button.dataset;
      updateStatus(id, action);
    });
  });
}

function renderWebhook() {
  const latest = payments[0] ?? null;
  const payload = latest
    ? {
        external_id: latest.externalId ?? latest.orderId,
        nominal: latest.amount,
        event: `payment.${latest.status}`,
        created: latest.createdAt,
        data: {
          id: latest.id,
          external_id: latest.externalId ?? latest.orderId,
          customer_name: latest.customerName,
          amount: latest.amount,
          channel: latest.channel,
          va_bank: latest.vaBank,
          va_number: latest.vaNumber,
          status: latest.status,
          invoice_url: latest.invoiceUrl,
          expiry_date: latest.expiresAt,
        },
      }
    : {};

  webhookPayload.textContent = JSON.stringify(payload, null, 2);
}

function statusClass(status) {
  switch (status) {
    case 'paid':
      return 'status-paid';
    case 'expired':
      return 'status-expired';
    case 'failed':
      return 'status-failed';
    default:
      return 'status-pending';
  }
}

function formatChannel(channel) {
  const map = {
    fva: 'Fixed Virtual Account',
    qris: 'QRIS',
    ewallet: 'E-Wallet',
    credit_card: 'Credit Card',
  };

  return map[channel] ?? channel;
}

function formatBank(bank) {
  const map = {
    bni: 'BNI',
    bca: 'BCA',
    bri: 'BRI',
    mandiri: 'Mandiri',
    permata: 'Permata',
  };

  return map[bank] ?? bank;
}

function generateVaNumber(bank) {
  const prefixes = {
    bni: '88888',
    bca: '70012',
    bri: '88810',
    mandiri: '88608',
    permata: '898',
  };

  const prefix = prefixes[bank] ?? '88888';
  const suffixLength = 10 - prefix.length;
  const suffix = Array.from({ length: suffixLength }, () => Math.floor(Math.random() * 10)).join('');

  return `${prefix}${suffix}`;
}

function formatDate(value) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
