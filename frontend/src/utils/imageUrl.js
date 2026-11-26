// "http://localhost:5000/api" -> "http://localhost:5000"
const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(
  /\/api\/?$/,
  ''
);

// Turns "/uploads/profile-images/x.jpg" into a full URL the browser can load.
export const getImageUrl = (path) => {
  if (!path) return '';
  return path.startsWith('http') ? path : `${API_ORIGIN}${path}`;
};