import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function CategoryChip({ label, icon = 'restaurant-outline', selected, onPress, disabled = false }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole='button'
      accessibilityState={{ selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: selected ? colors.primary : colors.surface, borderColor: selected ? colors.primary : colors.border },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Ionicons name={icon} size={16} color={selected ? '#FFFFFF' : colors.primary} />
      <Text style={[styles.label, { color: selected ? '#FFFFFF' : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 22, borderWidth: 1, marginRight: 9, flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: 14, fontWeight: '700' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.75 },
});
