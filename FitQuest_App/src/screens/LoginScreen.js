// src/screens/LoginScreen.js
// ============================================================
//  FitQuest – Login & Registration Screen
// ============================================================

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { registerUser, loginUser, createUserDocument } from '../services/firebaseConfig';

const COLORS = {
  primary:    '#1A3A5C',
  secondary:  '#2E5FA3',
  accent:     '#27AE60',
  orange:     '#E67E22',
  background: '#F4F7FB',
  white:      '#FFFFFF',
  textDark:   '#1A1A2E',
  textMid:    '#555577',
  border:     '#D0D7E3',
  error:      '#E74C3C',
};

export default function LoginScreen() {
  const [isLogin, setIsLogin]         = useState(true);
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [displayName, setDisplayName] = useState('');
  const [university, setUniversity]   = useState('Caleb University');
  const [loading, setLoading]         = useState(false);
  const [errors, setErrors]           = useState({});

  // ── Validation ───────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email';
    if (!password || password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!isLogin && !displayName.trim()) errs.displayName = 'Full name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit handler ────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isLogin) {
        await loginUser(email.trim(), password);
      } else {
        const user = await registerUser(email.trim(), password, displayName.trim());
        await createUserDocument(user.uid, {
          displayName: displayName.trim(),
          email: email.trim(),
          university,
        });
        Alert.alert(
          'Account Created!',
          'A verification email has been sent to your inbox. Please verify before logging in.',
          [{ text: 'OK', onPress: () => setIsLogin(true) }]
        );
      }
    } catch (err) {
      let msg = 'Something went wrong. Please try again.';
      if (err.code === 'auth/email-already-in-use') msg = 'This email is already registered.';
      if (err.code === 'auth/wrong-password')        msg = 'Incorrect password.';
      if (err.code === 'auth/user-not-found')        msg = 'No account found with this email.';
      if (err.code === 'auth/network-request-failed') msg = 'Network error. Check your connection.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, value, onChangeText, placeholder, secureTextEntry, errorKey, keyboardType }) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, errors[errorKey] && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMid}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || 'default'}
        autoCapitalize="none"
      />
      {errors[errorKey] ? <Text style={styles.errorText}>{errors[errorKey]}</Text> : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>FitQuest 🏅</Text>
          <Text style={styles.appSubtitle}>Level up your fitness journey</Text>
        </View>

        {/* Toggle Tabs */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, isLogin && styles.toggleActive]}
            onPress={() => { setIsLogin(true); setErrors({}); }}
          >
            <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, !isLogin && styles.toggleActive]}
            onPress={() => { setIsLogin(false); setErrors({}); }}
          >
            <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>Register</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.card}>
          {!isLogin && (
            <InputField
              label="Full Name"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your full name"
              errorKey="displayName"
            />
          )}
          <InputField
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            errorKey="email"
            keyboardType="email-address"
          />
          <InputField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Minimum 6 characters"
            secureTextEntry
            errorKey="password"
          />
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>University</Text>
              <View style={styles.universityBadge}>
                <Text style={styles.universityText}>🎓 {university}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color={COLORS.white} />
              : <Text style={styles.submitText}>{isLogin ? 'Log In' : 'Create Account'}</Text>
            }
          </TouchableOpacity>
        </View>

        {isLogin && (
          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot your password?</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footer}>
          Caleb University · Department of Computer Science
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: COLORS.background },
  scroll:           { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header:           { alignItems: 'center', marginBottom: 32 },
  appTitle:         { fontSize: 38, fontWeight: '800', color: COLORS.primary, letterSpacing: 1 },
  appSubtitle:      { fontSize: 15, color: COLORS.textMid, marginTop: 6 },
  toggleRow:        { flexDirection: 'row', backgroundColor: COLORS.border, borderRadius: 12, marginBottom: 24, padding: 4 },
  toggleBtn:        { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  toggleActive:     { backgroundColor: COLORS.primary },
  toggleText:       { fontSize: 15, fontWeight: '600', color: COLORS.textMid },
  toggleTextActive: { color: COLORS.white },
  card:             { backgroundColor: COLORS.white, borderRadius: 16, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  inputGroup:       { marginBottom: 16 },
  label:            { fontSize: 13, fontWeight: '600', color: COLORS.textDark, marginBottom: 6 },
  input:            { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: COLORS.textDark },
  inputError:       { borderColor: COLORS.error },
  errorText:        { color: COLORS.error, fontSize: 12, marginTop: 4 },
  universityBadge:  { backgroundColor: '#EBF5FB', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#AED6F1' },
  universityText:   { color: COLORS.secondary, fontWeight: '600', fontSize: 14 },
  submitBtn:        { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  submitBtnDisabled:{ opacity: 0.6 },
  submitText:       { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  forgotBtn:        { alignItems: 'center', marginTop: 16 },
  forgotText:       { color: COLORS.secondary, fontSize: 14 },
  footer:           { textAlign: 'center', color: COLORS.textMid, fontSize: 12, marginTop: 32 },
});
