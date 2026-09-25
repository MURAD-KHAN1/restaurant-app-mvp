import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function OrderStatusStep({ label, icon, isComplete, isCurrent, isLast }) {
  const { colors } = useTheme();
  const active = isComplete || isCurrent;
  return (
    <View style={styles.row}>
      <View style={styles.markerColumn}>
        <View style={[styles.marker, { backgroundColor: active ? colors.primary : colors.surfaceMuted, borderColor: active ? colors.primary : colors.border }]}>
          <Ionicons name={isComplete ? 'checkmark' : icon} size={20} color={active ? '#FFFFFF' : colors.secondaryText} />
        </View>
        {!isLast ? <View style={[styles.line, { backgroundColor: isComplete ? colors.primary : colors.border }]} /> : null}
      </View>
      <View style={styles.textBlock}>
        <Text style={[styles.label, { color: active ? colors.text : colors.secondaryText }]}>{label}</Text>
        {isCurrent ? <Text style={[styles.current, { color: colors.primary }]}>Current status</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', minHeight: 70 },
  markerColumn: { width: 48, alignItems: 'center' },
  marker: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  line: { width: 3, flex: 1, marginVertical: 3, borderRadius: 2 },
  textBlock: { paddingTop: 8, paddingLeft: 8 },
  label: { fontSize: 16, fontWeight: '800' },
  current: { fontSize: 12, fontWeight: '700', marginTop: 3 },
});
