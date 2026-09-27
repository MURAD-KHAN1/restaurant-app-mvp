import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { BRAND_SHORT_NAME } from '../constants/brand';
import { useTheme } from '../context/ThemeContext';
import { FadeSlideView } from './Motion';

export default function LoadingScreen({ message = 'Preparing your table…' }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FadeSlideView style={styles.brandBlock}>
        <View style={[styles.brand, { backgroundColor: colors.surface, borderColor: colors.accent, shadowColor: colors.shadow }]}>
          <Image source={require('../../assets/hiba-mark.png')} style={styles.brandImage} resizeMode='contain' />
        </View>
        <Text style={[styles.brandName, { color: colors.text }]}>{BRAND_SHORT_NAME}</Text>
      </FadeSlideView>
      <ActivityIndicator color={colors.primary} size='large' />
      <Text style={[styles.message, { color: colors.secondaryText }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  brandBlock: { alignItems: 'center', marginBottom: 24 },
  brand: { width: 76, height: 76, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowOpacity: 0.14, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  brandImage: { width: 61, height: 61 },
  brandName: { fontSize: 18, fontWeight: '900', marginTop: 10 },
  message: { marginTop: 14, fontSize: 15, fontWeight: '600' },
});
