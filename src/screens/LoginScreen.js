// ==================================================
// FILE: LoginScreen.js
// PURPOSE: Shows login and registration in one screen
// VIVA: Edit inputs, validation, roles and login/register buttons here
// ==================================================

// ===== IMPORTS =====
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Alert from '../utils/alerts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FadeSlideView, ScalePressable } from '../components/Motion';
import { BRAND_NAME, BRAND_TAGLINE } from '../constants/brand';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useForm } from '../hooks/useForm';

const INITIAL_VALUES = { name: '', email: '', password: '', confirmPassword: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ===== LOGIN VALIDATION =====
function validateLogin(values) {
  const errors = {};
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Enter a valid email address.';
  if (!values.password) errors.password = 'Password is required.';
  return errors;
}

// ===== REGISTER VALIDATION =====
function validateSignup(values) {
  const errors = validateLogin(values);
  if (values.password.length < 8 || !/\d/.test(values.password)) errors.password = 'Use at least 8 characters and one number.';
  if (!values.name.trim()) errors.name = 'Full name is required.';
  if (values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords do not match.';
  return errors;
}

// ===== INPUT PROPS AND ERROR MESSAGE =====
function FormInput({ label, icon, error, colors, secureTextEntry, rightAction, ...props }) {
  // ===== MAIN DISPLAY =====
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View style={[styles.inputShell, { backgroundColor: colors.background, borderColor: error ? colors.danger : colors.border }]}>
        <Ionicons name={icon} size={20} color={error ? colors.danger : colors.secondaryText} />
        <TextInput placeholderTextColor={colors.secondaryText} secureTextEntry={secureTextEntry} style={[styles.input, { color: colors.text }]} {...props} />
        {rightAction}
      </View>
      {error ? <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
}

export default function LoginScreen() {
  // ===== GET SHARED DATA =====
  const { colors } = useTheme();
  const { login, signup } = useAuth();
  // ===== LOCAL STATE =====
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);
  const [heroProgress] = useState(() => new Animated.Value(0));
  const isSignup = mode === 'signup';

  useEffect(() => {
    heroProgress.setValue(0);
    Animated.spring(heroProgress, {
      toValue: 1,
      damping: 14,
      stiffness: 115,
      mass: 0.8,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [heroProgress, mode]);

  // ===== LOGIN FUNCTION / REGISTER FUNCTION =====
  const submit = async (values) => {
    if (submitting.current) return;
    submitting.current = true;
    setIsSubmitting(true);
    try {
      if (isSignup) await signup({ name: values.name.trim(), email: values.email, password: values.password });
      else await login(values.email, values.password);
    } catch (error) {
      Alert.alert(isSignup ? 'Could not create account' : 'Login failed', error.message || 'Please try again.');
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  };

  const form = useForm(INITIAL_VALUES, isSignup ? validateSignup : validateLogin, submit);
  // ===== SWITCH LOGIN / REGISTER =====
  const changeMode = (nextMode) => {
    setMode(nextMode);
    setShowPassword(false);
    form.reset(INITIAL_VALUES);
  };

  // ===== MAIN DISPLAY =====
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps='handled'>
          <Animated.View
            style={[
              styles.hero,
              {
                opacity: heroProgress,
                transform: [
                  { translateY: heroProgress.interpolate({ inputRange: [0, 1], outputRange: [-18, 0] }) },
                  { scale: heroProgress.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }) },
                ],
              },
            ]}
          >
            <View style={[styles.logo, { backgroundColor: colors.surface, borderColor: colors.accent, shadowColor: colors.shadow }]}>
              <Image source={require('../../assets/hiba-mark.png')} style={styles.logoImage} resizeMode='contain' />
            </View>
            <Text style={[styles.brand, { color: colors.text }]}>{BRAND_NAME}</Text>
            <Text style={[styles.tagline, { color: colors.secondaryText }]}>{BRAND_TAGLINE}</Text>
          </Animated.View>
          <FadeSlideView delay={100} distance={22} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
            <View style={[styles.segment, { backgroundColor: colors.surfaceMuted }]}>
              {/* ===== LOGIN / REGISTER MODE BUTTONS ===== */}
              {['login', 'signup'].map((item) => (
                <ScalePressable key={item} disabled={isSubmitting} onPress={() => changeMode(item)} style={[styles.segmentButton, mode === item && { backgroundColor: colors.primary }]}>
                  <Text style={[styles.segmentText, { color: mode === item ? '#FFFFFF' : colors.secondaryText }]}>
                    {item === 'login' ? 'Login' : 'Sign Up'}
                  </Text>
                </ScalePressable>
              ))}
            </View>
            <Text style={[styles.heading, { color: colors.text }]}>{isSignup ? 'Create your account' : 'Back Welcome'}</Text>
            <Text style={[styles.subheading, { color: colors.secondaryText }]}>
              {isSignup ? 'Join Hiba Cafe as a guest.' : 'Sign in to continue your Hiba Cafe experience.'}
            </Text>
            {isSignup ? (
              <FormInput label='Full name' icon='person-outline' colors={colors} error={form.errors.name} placeholder='Your name' autoCapitalize='words' value={form.values.name} onChangeText={(value) => form.handleChange('name', value)} />
            ) : null}
            {/* ===== EMAIL INPUT ===== */}
            <FormInput label='Email' icon='mail-outline' colors={colors} error={form.errors.email} placeholder='you@example.com' autoCapitalize='none' keyboardType='email-address' value={form.values.email} onChangeText={(value) => form.handleChange('email', value)} />
            {/* ===== PASSWORD INPUT ===== */}
            <FormInput
              label='Password'
              icon='lock-closed-outline'
              colors={colors}
              error={form.errors.password}
              placeholder='Enter password'
              secureTextEntry={!showPassword}
              value={form.values.password}
              onChangeText={(value) => form.handleChange('password', value)}
              rightAction={(
                <Pressable accessibilityLabel={showPassword ? 'Hide password' : 'Show password'} onPress={() => setShowPassword((current) => !current)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={21} color={colors.secondaryText} />
                </Pressable>
              )}
            />
            {isSignup ? (
              <>
                {/* ===== CONFIRM PASSWORD INPUT ===== */}
                <FormInput label='Confirm password' icon='shield-checkmark-outline' colors={colors} error={form.errors.confirmPassword} placeholder='Repeat password' secureTextEntry={!showPassword} value={form.values.confirmPassword} onChangeText={(value) => form.handleChange('confirmPassword', value)} />
              </>
            ) : null}
            {/* ===== LOGIN BUTTON / REGISTER BUTTON ===== */}
            <ScalePressable disabled={isSubmitting} onPress={form.handleSubmit} style={[styles.submit, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}>
              {isSubmitting ? <ActivityIndicator color='#FFFFFF' /> : (
                <>
                  <Text style={styles.submitText}>{isSignup ? 'Create Account' : 'Login'}</Text>
                  <Ionicons name='arrow-forward' size={20} color='#FFFFFF' />
                </>
              )}
            </ScalePressable>
            {!isSignup ? (
              <View style={[styles.demoBox, { backgroundColor: colors.surfaceMuted }]}>
                <Text style={[styles.demoTitle, { color: colors.text }]}>Demo accounts</Text>
                <Text style={[styles.demoText, { color: colors.secondaryText }]}>Use the demo accounts listed in the README.</Text>
              </View>
            ) : null}
          </FadeSlideView>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ===== SCREEN DESIGN / STYLES =====
const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingBottom: 36 },
  hero: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 82, height: 82, borderRadius: 26, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 13, elevation: 7, shadowOpacity: 0.16, shadowRadius: 14, shadowOffset: { width: 0, height: 7 } },
  logoImage: { width: 66, height: 66 },
  brand: { fontSize: 28, lineHeight: 34, fontWeight: '900', letterSpacing: -0.7, textAlign: 'center' },
  tagline: { fontSize: 14, marginTop: 5, textAlign: 'center' },
  card: { borderRadius: 26, borderWidth: 1, padding: 20, elevation: 5, shadowOpacity: 0.11, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
  segment: { flexDirection: 'row', padding: 4, borderRadius: 14, marginBottom: 22 },
  segmentButton: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 11 },
  segmentText: { fontSize: 14, fontWeight: '800' },
  heading: { fontSize: 24, fontWeight: '900' },
  subheading: { fontSize: 14, lineHeight: 20, marginTop: 5, marginBottom: 20 },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '800', marginBottom: 7 },
  inputShell: { minHeight: 50, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  input: { flex: 1, fontSize: 15, paddingVertical: 12 },
  errorText: { fontSize: 12, fontWeight: '600', marginTop: 5 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  roleButton: { flex: 1, minHeight: 49, borderWidth: 1.5, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submit: { minHeight: 54, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 5, elevation: 4, shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  demoBox: { borderRadius: 14, padding: 13, marginTop: 16 },
  demoTitle: { fontSize: 13, fontWeight: '900', marginBottom: 4 },
  demoText: { fontSize: 11, lineHeight: 17 },
});
