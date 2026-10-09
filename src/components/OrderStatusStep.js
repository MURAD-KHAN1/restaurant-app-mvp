// ==================================================
// FILE: OrderStatusStep.js
// PURPOSE: Shows one step in the order tracker
// VIVA: Props: label, icon, isComplete, isCurrent and isLast control the step
// ==================================================

// ===== IMPORTS =====
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// ===== COMPONENT PROPS: OrderStatusStep =====
export default function OrderStatusStep({ label, icon, isComplete, isCurrent, isLast }) {
  // ===== GET SHARED DATA =====
  const { colors } = useTheme();
  const active = isComplete || isCurrent;
  // ===== LOCAL STATE =====
  const [markerScale] = useState(() => new Animated.Value(active ? 0.75 : 1));

  useEffect(() => {
    if (!active) return undefined;
    markerScale.setValue(0.75);
    const animation = Animated.sequence([
      Animated.spring(markerScale, { toValue: 1, damping: 10, stiffness: 220, useNativeDriver: Platform.OS !== 'web' }),
      ...(isCurrent ? [
        Animated.spring(markerScale, { toValue: 1.12, damping: 9, stiffness: 240, useNativeDriver: Platform.OS !== 'web' }),
        Animated.spring(markerScale, { toValue: 1, damping: 11, stiffness: 240, useNativeDriver: Platform.OS !== 'web' }),
      ] : []),
    ]);
    animation.start();
    return () => animation.stop();
  }, [active, isCurrent, markerScale]);

  // ===== MAIN DISPLAY =====
  return (
    <View style={styles.row}>
      <View style={styles.markerColumn}>
        <Animated.View style={[styles.marker, { backgroundColor: active ? colors.primary : colors.surfaceMuted, borderColor: active ? colors.accent : colors.border, transform: [{ scale: markerScale }] }]}>
          <Ionicons name={isComplete ? 'checkmark' : icon} size={20} color={active ? '#FFFFFF' : colors.secondaryText} />
        </Animated.View>
        {!isLast ? <Animated.View style={[styles.line, { backgroundColor: isComplete ? colors.primary : colors.border, opacity: isComplete ? markerScale : 1 }]} /> : null}
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.label, { color: active ? colors.text : colors.secondaryText }]}>{label}</Text>
        {isCurrent ? <Text style={[styles.current, { color: colors.primary }]}>Current status</Text> : null}
      </View>
    </View>
  );
}

// ===== SCREEN DESIGN / STYLES =====
const styles = StyleSheet.create({
  row: { flexDirection: 'row', minHeight: 70 },
  markerColumn: { width: 48, alignItems: 'center' },
  marker: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  line: { width: 3, flex: 1, marginVertical: 3, borderRadius: 2 },
  textBlock: { paddingTop: 8, paddingLeft: 8 },
  label: { fontSize: 16, fontWeight: '800' },
  current: { fontSize: 12, fontWeight: '700', marginTop: 3 },
});
