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
const channelEl = document.getElementById('channel');
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
    channel: channelEl.value,
    expiryMinutes: Number(expiryMinutesEl.value),
  });

  payments = [payment, ...payments];
  savePayments();
  render();
  paymentForm.reset();
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
      channel: 'bank_transfer',
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
  expiryMinutes,
  status = 'pending',
}) {
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + expiryMinutes * 60 * 1000);
  const paymentId = `pay_${Math.random().toString(36).slice(2, 10)}`;

  return {
    id: paymentId,
    customerName,
    orderId,
    amount,
    channel,
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
              <h3 class="payment-title">${escapeHtml(payment.orderId)} · ${escapeHtml(payment.customerName)}</h3>
              <p class="payment-meta">${currencyFormatter.format(payment.amount)} · ${formatChannel(payment.channel)}</p>
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
        event: `payment.${latest.status}`,
        created: latest.createdAt,
        data: {
          id: latest.id,
          order_id: latest.orderId,
          customer_name: latest.customerName,
          amount: latest.amount,
          channel: latest.channel,
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
    bank_transfer: 'Bank Transfer',
    qris: 'QRIS',
    ewallet: 'E-Wallet',
    credit_card: 'Credit Card',
  };

  return map[channel] ?? channel;
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
