export const SOON_DAYS = 3; // "expiring soon" = today + the next 2 days

export const SERVER_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

export const endOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// Last moment that still counts as "expiring soon"
export const getSoonThreshold = (now = new Date()) => {
  const d = endOfDay(now);
  d.setDate(d.getDate() + SOON_DAYS - 1);
  return d;
};

// First moment of a month. offset 0 = this month, -1 = last month ...
export const getMonthStart = (offset = 0, now = new Date()) =>
  new Date(now.getFullYear(), now.getMonth() + offset, 1);

// "2026-11"
export const getMonthKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

// 'expired' | 'expires_today' | 'expiring_soon' | 'fresh'
export const getExpiryStatus = (expiryDate, now = new Date()) => {
  const expiry = new Date(expiryDate);
  if (expiry < now) return 'expired';
  if (expiry <= endOfDay(now)) return 'expires_today';
  if (expiry <= getSoonThreshold(now)) return 'expiring_soon';
  return 'fresh';
};

export const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;