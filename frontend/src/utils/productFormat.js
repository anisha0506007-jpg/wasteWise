const pad = (n) => String(n).padStart(2, '0');

export const toDateInput = (value) => {
  const d = new Date(value);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const toTimeInput = (value) => {
  const d = new Date(value);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// For <input type="datetime-local">
export const toDateTimeLocalInput = (value) =>
  value ? `${toDateInput(value)}T${toTimeInput(value)}` : '';

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '-';

// Manufacturing dates are stored as plain dates (UTC midnight), so show them in UTC
export const formatDateOnly = (value) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : '-';

// "26 Nov 2026, 10:00 am to 2:00 pm"  or  "26 Nov, 10:00 am to 27 Nov, 9:00 am"
export const formatPickupWindow = (start, end) => {
  if (!start || !end) return '-';
  const s = new Date(start);
  const e = new Date(end);
  const time = (d) => d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

  if (s.toDateString() === e.toDateString()) {
    const day = s.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${day}, ${time(s)} to ${time(e)}`;
  }
  return `${formatDateTime(s)} to ${formatDateTime(e)}`;
};