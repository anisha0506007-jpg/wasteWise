const DAY_MS = 24 * 60 * 60 * 1000;

export const getGreeting = (date = new Date()) => {
  const hour = date.getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export const formatLongDate = (date = new Date()) =>
  date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '-';

export const formatNumber = (value) =>
  Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

export const formatQuantity = (quantity, unit = '') => `${formatNumber(quantity)} ${unit}`.trim();

export const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?';

// "5 min ago", "3 hours ago", "2 days ago"
export const timeAgo = (value) => {
  const seconds = Math.max(Math.floor((Date.now() - new Date(value).getTime()) / 1000), 0);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return formatDate(value);
};

// "Expires in 3 days", "Expires today at 6:00 pm", "Expired 2 days ago"
export const describeExpiry = (value) => {
  const now = new Date();
  const expiry = new Date(value);

  if (expiry < now) {
    const days = Math.floor((now - expiry) / DAY_MS);
    if (days < 1) return 'Expired today';
    return `Expired ${days} day${days === 1 ? '' : 's'} ago`;
  }
  if (expiry.toDateString() === now.toDateString()) {
    const time = expiry.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
    return `Expires today at ${time}`;
  }
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const days = Math.round((startOfDay(expiry) - startOfDay(now)) / DAY_MS);
  return days === 1 ? 'Expires tomorrow' : `Expires in ${days} days`;
};