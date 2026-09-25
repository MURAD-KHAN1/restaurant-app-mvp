import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { categoryColors, formatCurrency } from '../theme/colors';

function MenuItemCard({ item, onAdd, onToggleFavourite, isFavourite }) {
  const { colors } = useTheme();
  const [imageFailed, setImageFailed] = useState(false);
  const categoryColor = categoryColors[item.category] ?? colors.primary;
  const hasImage = Boolean(item.image) && !imageFailed;

  useEffect(() => setImageFailed(false), [item.image]);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow, borderColor: colors.border }, !item.isAvailable && styles.unavailableCard]}>
      <View style={[styles.visual, { backgroundColor: colors.surfaceMuted }]}>
        {hasImage ? (
          <Image
            source={item.image}
            style={styles.foodImage}
            resizeMode='cover'
            resizeMethod='resize'
            fadeDuration={160}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={[styles.fallback, { backgroundColor: categoryColor + '22' }]}>
            <View style={[styles.fallbackCircle, { backgroundColor: colors.surface }]}>
              <Ionicons name={item.icon || 'restaurant'} size={45} color={categoryColor} />
            </View>
            <Text style={[styles.fallbackText, { color: colors.secondaryText }]}>Freshly prepared for you</Text>
          </View>
        )}

        <View style={[styles.categoryPill, { backgroundColor: categoryColor }]}>
          <Ionicons name={item.icon || 'restaurant-outline'} size={13} color='#FFFFFF' />
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>

        {item.isSpecial ? (
          <View style={[styles.specialBadge, { backgroundColor: colors.accent }]}>
            <Ionicons name='star' size={13} color='#4A2A0B' />
            <Text style={styles.specialText}>DAILY SPECIAL</Text>
          </View>
        ) : null}

        <Pressable
          accessibilityLabel={isFavourite ? 'Remove ' + item.name + ' from favourites' : 'Add ' + item.name + ' to favourites'}
          hitSlop={8}
          onPress={() => onToggleFavourite(item.id)}
          style={[styles.heart, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}
        >
          <Ionicons name={isFavourite ? 'heart' : 'heart-outline'} size={23} color={isFavourite ? colors.danger : colors.text} />
        </Pressable>

        {!item.isAvailable ? (
          <View pointerEvents='none' style={styles.unavailableOverlay}>
            <View style={styles.unavailablePill}>
              <Ionicons name='close-circle' size={18} color='#FFFFFF' />
              <Text style={styles.unavailableOverlayText}>Currently unavailable</Text>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text numberOfLines={2} style={[styles.name, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.price, { color: colors.primary }]}>{formatCurrency(item.price)}</Text>
        </View>
        <Text numberOfLines={2} style={[styles.description, { color: colors.secondaryText }]}>{item.description}</Text>
        <View style={styles.footer}>
          <View style={styles.availability}>
            <Ionicons name={item.isAvailable ? 'checkmark-circle' : 'close-circle'} size={17} color={item.isAvailable ? colors.success : colors.danger} />
            <Text style={[styles.availabilityText, { color: item.isAvailable ? colors.success : colors.danger }]}>
              {item.isAvailable ? 'Available now' : 'Unavailable'}
            </Text>
          </View>
          <Pressable
            accessibilityRole='button'
            disabled={!item.isAvailable}
            onPress={() => onAdd(item)}
            style={({ pressed }) => [
              styles.addButton,
              { backgroundColor: item.isAvailable ? colors.primary : colors.border },
              pressed && item.isAvailable && styles.pressed,
            ]}
          >
            <Ionicons name='add-circle' size={20} color='#FFFFFF' />
            <Text style={styles.addText}>Add to cart</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default React.memo(MenuItemCard);

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 22,
    marginHorizontal: 16,
    marginBottom: 18,
    overflow: 'hidden',
    elevation: 4,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },
  unavailableCard: { opacity: 0.78 },
  visual: { height: 196, overflow: 'hidden' },
  foodImage: { width: '100%', height: 196 },
  fallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fallbackCircle: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center' },
  fallbackText: { fontSize: 12, fontWeight: '700', marginTop: 9 },
  categoryPill: { position: 'absolute', left: 12, bottom: 11, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 5 },
  categoryText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  specialBadge: { position: 'absolute', top: 11, left: 11, flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 11, paddingHorizontal: 9, paddingVertical: 6 },
  specialText: { color: '#4A2A0B', fontSize: 9, fontWeight: '900', letterSpacing: 0.3 },
  heart: { position: 'absolute', top: 10, right: 10, width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowOpacity: 0.16, shadowRadius: 5 },
  unavailableOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(17,24,39,0.52)', alignItems: 'center', justifyContent: 'center' },
  unavailablePill: { backgroundColor: 'rgba(17,24,39,0.86)', borderRadius: 18, paddingHorizontal: 13, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 6 },
  unavailableOverlayText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  content: { padding: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  name: { flex: 1, fontSize: 18, lineHeight: 23, fontWeight: '900' },
  price: { fontSize: 17, fontWeight: '900' },
  description: { marginTop: 7, fontSize: 13, lineHeight: 19 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 15, gap: 8 },
  availability: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 5 },
  availabilityText: { fontSize: 11, fontWeight: '800' },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 13 },
  addText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
});
