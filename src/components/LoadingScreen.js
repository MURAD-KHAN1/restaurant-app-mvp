import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function LoadingScreen({ message = 'Preparing your table…' }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.brand, { backgroundColor: colors.primary }]}>
        <Text style={styles.brandText}>S</Text>
      </View>
      <ActivityIndicator color={colors.primary} size='large' />
      <Text style={[styles.message, { color: colors.secondaryText }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  brand: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  brandText: { color: '#FFFFFF', fontSize: 30, fontWeight: '900' },
  message: { marginTop: 14, fontSize: 15, fontWeight: '600' },
});
