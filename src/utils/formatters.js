export const formatActivityTime = (time) => time;
export const formatBudget = (amount) => `$${amount}`;

// ============================================================
// CURRENCY FORMATTING
// ============================================================
const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: 'CA$',
  AUD: 'A$', INR: '₹', CHF: 'CHF', CNY: '¥', KRW: '₩',
  SGD: 'S$', MXN: 'MX$', BRL: 'R$', ZAR: 'R', AED: 'AED',
};

export const formatCurrency = (amount, currencyCode = 'USD') => {
  const symbol = CURRENCY_SYMBOLS[currencyCode] || currencyCode;
  const absAmount = Math.abs(amount || 0);
  const formatted = absAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${symbol}${formatted}`;
};

// ============================================================
// DATE FORMATTING
// ============================================================
export const formatDate = (dateStr, format = 'short', timezone = null) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;

  const opts = timezone ? { timeZone: timezone } : {};

  if (format === 'relative') {
    const now = new Date();
    const diffMs = date - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0 && diffDays <= 30) return `In ${diffDays} days`;
    if (diffDays < 0 && diffDays >= -30) return `${Math.abs(diffDays)} days ago`;
  }
  if (format === 'long') {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', ...opts });
  }
  // Default: 'short'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', ...opts });
};

export const formatTripDates = (start, end, dateFormat = 'MM/DD/YYYY') => {
  if (!start) return 'No date set';
  const formatSingle = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    if (dateFormat === 'DD/MM/YYYY') return `${day}/${m}/${y}`;
    if (dateFormat === 'YYYY-MM-DD') return `${y}-${m}-${day}`;
    return `${m}/${day}/${y}`; // Default MM/DD/YYYY
  };
  return end ? `${formatSingle(start)} – ${formatSingle(end)}` : formatSingle(start);
};

// ============================================================
// TRIP DURATION
// ============================================================
export const getTripDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end - start;
  if (diffMs < 0) return null;
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return '1 day';
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  const weeks = Math.floor(days / 7);
  const rem = days % 7;
  if (rem === 0) return weeks === 1 ? '1 week' : `${weeks} weeks`;
  return `${weeks}w ${rem}d`;
};

// ============================================================
// BUDGET PER PERSON
// ============================================================
export const getBudgetPerPerson = (totalBudget, memberCount) => {
  if (!totalBudget || !memberCount || memberCount === 0) return null;
  return totalBudget / memberCount;
};