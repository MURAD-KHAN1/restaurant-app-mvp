import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useForm } from '../hooks/useForm';

const INITIAL_VALUES = { name: '', email: '', password: '', confirmPassword: '', role: 'customer' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLogin(values) {
  const errors = {};
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Enter a valid email address.';
  if (!values.password) errors.password = 'Password is required.';
  else if (values.password.length < 8 || !/\d/.test(values.password)) errors.password = 'Use at least 8 characters and one number.';
  return errors;
}

function validateSignup(values) {
  const errors = validateLogin(values);
  if (!values.name.trim()) errors.name = 'Full name is required.';
  if (values.confirmPassword !== values.password) errors.confirmPassword = 'Passwords do not match.';
  return errors;
}

function FormInput({ label, icon, error, colors, secureTextEntry, rightAction, ...props }) {
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
  const { colors } = useTheme();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSignup = mode === 'signup';

  const submit = async (values) => {
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (isSignup) {
      const result = signup({ name: values.name.trim(), email: values.email, password: values.password, role: values.role });
      if (!result.success) Alert.alert('Could not create account', result.message);
    } else if (!login(values.email, values.password)) {
      Alert.alert('Login failed', 'The email or password is incorrect. Check the demo credentials and try again.');
    }
    setIsSubmitting(false);
  };

  const form = useForm(INITIAL_VALUES, isSignup ? validateSignup : validateLogin, submit);
  const changeMode = (nextMode) => {
    setMode(nextMode);
    setShowPassword(false);
    form.reset(INITIAL_VALUES);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps='handled'>
          <View style={styles.hero}>
            <View style={[styles.logo, { backgroundColor: colors.primary }]}>
              <Ionicons name='restaurant' size={34} color='#FFFFFF' />
            </View>
            <Text style={[styles.brand, { color: colors.text }]}>Saffron Table</Text>
            <Text style={[styles.tagline, { color: colors.secondaryText }]}>Memorable flavours, one tap away.</Text>
          </View>
          <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
            <View style={[styles.segment, { backgroundColor: colors.surfaceMuted }]}>
              {['login', 'signup'].map((item) => (
                <Pressable key={item} disabled={isSubmitting} onPress={() => changeMode(item)} style={[styles.segmentButton, mode === item && { backgroundColor: colors.primary }]}>
                  <Text style={[styles.segmentText, { color: mode === item ? '#FFFFFF' : colors.secondaryText }]}>
                    {item === 'login' ? 'Login' : 'Sign Up'}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={[styles.heading, { color: colors.text }]}>{isSignup ? 'Create your account' : 'Welcome back'}</Text>
            <Text style={[styles.subheading, { color: colors.secondaryText }]}>
              {isSignup ? 'Join as a diner or restaurant manager.' : 'Sign in to continue your restaurant experience.'}
            </Text>
            {isSignup ? (
              <FormInput label='Full name' icon='person-outline' colors={colors} error={form.errors.name} placeholder='Your name' autoCapitalize='words' value={form.values.name} onChangeText={(value) => form.handleChange('name', value)} />
            ) : null}
            <FormInput label='Email' icon='mail-outline' colors={colors} error={form.errors.email} placeholder='you@example.com' autoCapitalize='none' keyboardType='email-address' value={form.values.email} onChangeText={(value) => form.handleChange('email', value)} />
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
                <FormInput label='Confirm password' icon='shield-checkmark-outline' colors={colors} error={form.errors.confirmPassword} placeholder='Repeat password' secureTextEntry={!showPassword} value={form.values.confirmPassword} onChangeText={(value) => form.handleChange('confirmPassword', value)} />
                <Text style={[styles.label, { color: colors.text }]}>Account role</Text>
                <View style={styles.roleRow}>
                  {[['customer', 'Customer', 'person-outline'], ['manager', 'Manager', 'briefcase-outline']].map(([value, label, icon]) => {
                    const selected = form.values.role === value;
                    return (
                      <Pressable key={value} onPress={() => form.handleChange('role', value)} style={[styles.roleButton, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? colors.surfaceMuted : colors.background }]}>
                        <Ionicons name={icon} size={20} color={selected ? colors.primary : colors.secondaryText} />
                        <Text style={{ color: selected ? colors.primary : colors.text, fontWeight: '800' }}>{label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}
            <Pressable disabled={isSubmitting} onPress={form.handleSubmit} style={({ pressed }) => [styles.submit, { backgroundColor: colors.primary }, (pressed || isSubmitting) && styles.submitPressed]}>
              {isSubmitting ? <ActivityIndicator color='#FFFFFF' /> : (
                <>
                  <Text style={styles.submitText}>{isSignup ? 'Create Account' : 'Login'}</Text>
                  <Ionicons name='arrow-forward' size={20} color='#FFFFFF' />
                </>
              )}
            </Pressable>
            {!isSignup ? (
              <View style={[styles.demoBox, { backgroundColor: colors.surfaceMuted }]}>
                <Text style={[styles.demoTitle, { color: colors.text }]}>Demo accounts</Text>
                <Text style={[styles.demoText, { color: colors.secondaryText }]}>Customer: customer@example.com / Password123</Text>
                <Text style={[styles.demoText, { color: colors.secondaryText }]}>Manager: manager@example.com / Manager123</Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingBottom: 36 },
  hero: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 68, height: 68, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  brand: { fontSize: 30, fontWeight: '900', letterSpacing: -0.8 },
  tagline: { fontSize: 14, marginTop: 4 },
  card: { borderRadius: 24, padding: 20, elevation: 5, shadowOpacity: 0.12, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } },
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
  submit: { minHeight: 52, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 5 },
  submitPressed: { opacity: 0.72 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  demoBox: { borderRadius: 14, padding: 13, marginTop: 16 },
  demoTitle: { fontSize: 13, fontWeight: '900', marginBottom: 4 },
  demoText: { fontSize: 11, lineHeight: 17 },
});
