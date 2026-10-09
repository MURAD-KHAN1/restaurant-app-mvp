import { CATEGORY_ICONS, MENU_IMAGES } from '../constants/menu';
export function normalizeMenu(items) {
  if (!Array.isArray(items)) throw new Error('The server returned an invalid menu. Please try again.');
  return items.map(item => {
    if (!item || typeof item._id !== 'string' || typeof item.name !== 'string') {
      throw new Error('The server returned an invalid menu item. Please try again.');
    }
    const image = typeof item.image === 'string' ? item.image : '';
    return { id: item._id, name: item.name, description: item.description || '',
      category: item.category || 'Mains', price: Number.isFinite(item.price) ? item.price : 0,
      isAvailable: item.available !== false, isSpecial: item.isSpecial === true,
      image: MENU_IMAGES[image] || (/^https?:\/\//i.test(image) ? {uri:image} : null),
      icon: CATEGORY_ICONS[item.category] || 'restaurant-outline' };
  });
}
