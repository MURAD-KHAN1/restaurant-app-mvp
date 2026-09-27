import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FadeSlideView, ScalePressable } from './Motion';

export default function EmptyState({ icon = 'restaurant-outline', title, message, actionLabel, onAction }) {
  const { colors } = useTheme();
  return (
    <FadeSlideView style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: colors.surfaceMuted }]}>
        <Ionicons name={icon} size={38} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.secondaryText }]}>{message}</Text>
      {actionLabel ? (
        <ScalePressable onPress={onAction} style={[styles.button, { backgroundColor: colors.primary }]}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </ScalePressable>
      ) : null}
    </FadeSlideView>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 48 },
  iconCircle: { width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  title: { fontSize: 20, lineHeight: 26, fontWeight: '800', textAlign: 'center' },
  message: { marginTop: 7, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  button: { marginTop: 20, borderRadius: 14, paddingHorizontal: 22, paddingVertical: 12 },
  buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});
