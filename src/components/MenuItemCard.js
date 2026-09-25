import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { categoryColors, formatCurrency } from '../theme/colors';

function MenuItemCard({ item, onAdd, onToggleFavourite, isFavourite }) {
  const { colors } = useTheme();
  console.log(`MenuItemCard rendered: ${item.name}`);
  const categoryColor = categoryColors[item.category] ?? colors.primary;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }, !item.isAvailable && styles.unavailableCard]}>
      <View style={[styles.visual, { backgroundColor: `${categoryColor}20` }]}>
        <Ionicons name={item.image || 'restaurant-outline'} size={52} color={categoryColor} />
        <View style={[styles.categoryPill, { backgroundColor: categoryColor }]}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        {item.isSpecial ? (
          <View style={[styles.specialBadge, { backgroundColor: colors.accent }]}>
            <Ionicons name='sparkles' size={13} color='#44250C' />
            <Text style={styles.specialText}>DAILY SPECIAL</Text>
          </View>
        ) : null}
        <Pressable
          accessibilityLabel={isFavourite ? `Remove ${item.name} from favourites` : `Add ${item.name} to favourites`}
          hitSlop={8}
          onPress={() => onToggleFavourite(item.id)}
          style={[styles.heart, { backgroundColor: colors.surface }]}
        >
          <Ionicons name={isFavourite ? 'heart' : 'heart-outline'} size={23} color={isFavourite ? colors.danger : colors.secondaryText} />
        </Pressable>
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text numberOfLines={2} style={[styles.name, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.price, { color: colors.primary }]}>{formatCurrency(item.price)}</Text>
        </View>
        <Text numberOfLines={2} style={[styles.description, { color: colors.secondaryText }]}>{item.description}</Text>
        <View style={styles.footer}>
          <View style={styles.availability}>
            <View style={[styles.dot, { backgroundColor: item.isAvailable ? colors.success : colors.danger }]} />
            <Text style={[styles.availabilityText, { color: item.isAvailable ? colors.success : colors.danger }]}>
              {item.isAvailable ? 'Available now' : 'Currently unavailable'}
            </Text>
          </View>
          <Pressable
            accessibilityRole='button'
            disabled={!item.isAvailable}
            onPress={() => onAdd(item)}
            style={({ pressed }) => [styles.addButton, { backgroundColor: item.isAvailable ? colors.primary : colors.border }, pressed && item.isAvailable && styles.pressed]}
          >
            <Ionicons name='add' size={19} color='#FFFFFF' />
            <Text style={styles.addText}>Add</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default React.memo(MenuItemCard);

const styles = StyleSheet.create({
  card: { borderRadius: 20, marginHorizontal: 16, marginBottom: 16, overflow: 'hidden', elevation: 3, shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  unavailableCard: { opacity: 0.68 },
  visual: { height: 128, alignItems: 'center', justifyContent: 'center' },
  categoryPill: { position: 'absolute', left: 12, bottom: 11, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  categoryText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  specialBadge: { position: 'absolute', top: 11, left: 11, flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5 },
  specialText: { color: '#44250C', fontSize: 10, fontWeight: '900' },
  heart: { position: 'absolute', top: 10, right: 10, width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  content: { padding: 15 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  name: { flex: 1, fontSize: 17, lineHeight: 22, fontWeight: '800' },
  price: { fontSize: 16, fontWeight: '900' },
  description: { marginTop: 6, fontSize: 13, lineHeight: 19 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  availability: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  availabilityText: { fontSize: 12, fontWeight: '700' },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
  addText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  pressed: { opacity: 0.78 },
});
