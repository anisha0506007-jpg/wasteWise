export const PUBLIC_ROLE_IDS = ['business', 'ngo', 'individual'];

export const ROLE_LABELS = {
  business: 'Business',
  ngo: 'NGO',
  individual: 'Individual',
  admin: 'Admin',
};

export const DASHBOARD_PATHS = {
  business: '/business/dashboard',
  ngo: '/ngo/dashboard',
  individual: '/individual/dashboard',
  admin: '/admin/dashboard',
};

export const BUSINESS_TYPES = [
  'Restaurant',
  'Bakery',
  'Grocery Store',
  'Hotel',
  'Supermarket',
  'Other',
];

export const getDashboardPath = (role) => DASHBOARD_PATHS[role] || '/';

// Dashboard URLs start with the role name (e.g. /ngo/dashboard)
export const canAccessPath = (role, path = '') => path.startsWith(`/${role}/`);