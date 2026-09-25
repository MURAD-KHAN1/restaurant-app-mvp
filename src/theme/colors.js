export const lightColors = {
  primary: '#E4572E', primaryDark: '#C2411F', accent: '#F4A261',
  background: '#FFF8F3', surface: '#FFFFFF', surfaceMuted: '#FFF0E8',
  text: '#1F2937', secondaryText: '#6B7280', border: '#E8DDD6',
  success: '#16A34A', danger: '#DC2626', warning: '#D97706',
  tabBar: '#FFFFFF', shadow: '#402012',
};

export const darkColors = {
  primary: '#FB6A3B', primaryDark: '#E4572E', accent: '#F4A261',
  background: '#111827', surface: '#1F2937', surfaceMuted: '#2B374A',
  text: '#F9FAFB', secondaryText: '#D1D5DB', border: '#374151',
  success: '#4ADE80', danger: '#F87171', warning: '#FBBF24',
  tabBar: '#18212F', shadow: '#000000',
};

export const categoryColors = {
  Starters: '#F59E0B', Mains: '#E4572E', Desserts: '#DB2777', Drinks: '#0891B2',
};

export const formatCurrency = (amount) =>
  `Rs. ${Math.round(Number(amount) || 0).toLocaleString('en-PK')}`;
