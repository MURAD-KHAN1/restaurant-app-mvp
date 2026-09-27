export const lightColors = {
  primary: '#8A2635', primaryDark: '#631B28', accent: '#D1A34F',
  background: '#FBF7F1', surface: '#FFFEFC', surfaceMuted: '#F5EADF',
  text: '#2B1D21', secondaryText: '#75676B', border: '#E7D9CE',
  success: '#2F7D5B', danger: '#B53B49', warning: '#B57920',
  tabBar: '#FFFEFC', shadow: '#3A151D',
};

export const darkColors = {
  primary: '#D85D6B', primaryDark: '#B63C4D', accent: '#E2B864',
  background: '#151012', surface: '#21191C', surfaceMuted: '#302329',
  text: '#FFF9F3', secondaryText: '#CDBEC2', border: '#49363D',
  success: '#69B98E', danger: '#FF7B89', warning: '#F0C16B',
  tabBar: '#1C1518', shadow: '#000000',
};

export const categoryColors = {
  Starters: '#B57920', Mains: '#8A2635', Desserts: '#A94D6B', Drinks: '#287A78',
};

export const formatCurrency = (amount) =>
  `Rs. ${Math.round(Number(amount) || 0).toLocaleString('en-PK')}`;
