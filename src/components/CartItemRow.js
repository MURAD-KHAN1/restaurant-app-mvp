import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../theme/colors';

function CartItemRow({ item, onIncrement, onDecrement, onRemove, onNoteChange }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <View style={[styles.iconBox, { backgroundColor: colors.surfaceMuted }]}>
          <Ionicons name={item.icon || 'restaurant-outline'} size={28} color={colors.primary} />
        </View>
        <View style={styles.details}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
          <Text style={[styles.price, { color: colors.primary }]}>{formatCurrency(item.price * item.quantity)}</Text>
        </View>
        <Pressable accessibilityLabel={'Remove ' + item.name} onPress={() => onRemove(item.id)} hitSlop={8}>
          <Ionicons name='trash-outline' size={21} color={colors.danger} />
        </Pressable>
      </View>
      <View style={styles.actions}>
        <View style={[styles.stepper, { backgroundColor: colors.surfaceMuted }]}>
          <Pressable onPress={() => onDecrement(item.id)} style={styles.stepButton}><Ionicons name='remove' size={18} color={colors.text} /></Pressable>
          <Text style={[styles.quantity, { color: colors.text }]}>{item.quantity}</Text>
          <Pressable onPress={() => onIncrement(item.id)} style={styles.stepButton}><Ionicons name='add' size={18} color={colors.text} /></Pressable>
        </View>
        <Text style={[styles.unitPrice, { color: colors.secondaryText }]}>{formatCurrency(item.price)} each</Text>
      </View>
      <View style={[styles.noteShell, { borderColor: colors.border, backgroundColor: colors.background }]}>
        <Ionicons name='create-outline' size={17} color={colors.secondaryText} />
        <TextInput
          value={item.note}
          onChangeText={(value) => onNoteChange(item.id, value)}
          placeholder='Add a kitchen note'
          placeholderTextColor={colors.secondaryText}
          style={[styles.noteInput, { color: colors.text }]}
          maxLength={80}
        />
      </View>
    </View>
  );
}

export default React.memo(CartItemRow);

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 19, padding: 14, marginBottom: 12 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 52, height: 52, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  details: { flex: 1 },
  name: { fontSize: 15, fontWeight: '800' },
  price: { fontSize: 14, fontWeight: '900', marginTop: 4 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 },
  stepper: { flexDirection: 'row', alignItems: 'center', borderRadius: 12 },
  stepButton: { width: 36, height: 34, alignItems: 'center', justifyContent: 'center' },
  quantity: { width: 28, textAlign: 'center', fontWeight: '900' },
  unitPrice: { fontSize: 12 },
  noteShell: { borderWidth: 1, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 11, marginTop: 12 },
  noteInput: { flex: 1, fontSize: 13, paddingVertical: 9, marginLeft: 6 },
});
