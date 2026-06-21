// src/screens/ProfileScreen.js
// ============================================================
//  FitQuest – User Profile & Settings Screen
// ============================================================

import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../services/firebaseConfig';
import { getLevelFromXP, getXPProgressToNextLevel, BADGES } from '../utils/gamificationUtils';

const COLORS = {
  primary: '#1A3A5C', secondary: '#2E5FA3', accent: '#27AE60',
  orange: '#E67E22', bg: '#F4F7FB', white: '#FFFFFF',
  textDark: '#1A1A2E', textMid: '#666688', border: '#D0D7E3', error: '#E74C3C',
};

export default function ProfileScreen({ navigation }) {
  const { userProfile } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const levelInfo  = userProfile ? getLevelFromXP(userProfile.currentXP || 0) : null;
  const xpProgress = userProfile ? getXPProgressToNextLevel(userProfile.currentXP || 0) : null;
  const earnedBadges = userProfile
    ? BADGES.filter(b => (userProfile.badgesEarned || []).includes(b.id))
    : [];

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive', onPress: async () => {
          setLoggingOut(true);
          await logoutUser();
          setLoggingOut(false);
        }
      }
    ]);
  };

  if (!userProfile) return (
    <View style={styles.center}><ActivityIndicator color={COLORS.primary} size="large" /></View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={[styles.bigAvatar, { backgroundColor: levelInfo?.color || COLORS.secondary }]}>
          <Text style={styles.bigInitial}>{userProfile.displayName?.[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.displayName}>{userProfile.displayName}</Text>
        <Text style={styles.email}>{userProfile.email}</Text>
        <View style={styles.universityRow}>
          <Text style={styles.universityText}>🎓 {userProfile.university}</Text>
        </View>
        <View style={[styles.levelTag, { backgroundColor: levelInfo?.color + '22', borderColor: levelInfo?.color }]}>
          <Text style={[styles.levelTagText, { color: levelInfo?.color }]}>
            Level {levelInfo?.level} – {levelInfo?.title}
          </Text>
        </View>
      </View>

      {/* XP Progress */}
      <View style={styles.xpCard}>
        <View style={styles.xpRow}>
          <Text style={styles.xpLabel}>XP Progress</Text>
          <Text style={styles.xpValue}>{userProfile.currentXP || 0} XP</Text>
        </View>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${xpProgress?.percentage || 0}%`, backgroundColor: levelInfo?.color || COLORS.accent }]} />
        </View>
        {xpProgress?.nextLevel && (
          <Text style={styles.xpNext}>{xpProgress.remaining} XP until {xpProgress.nextLevel.title}</Text>
        )}
      </View>

      {/* Stats Grid */}
      <Text style={styles.sectionTitle}>Statistics</Text>
      <View style={styles.statsGrid}>
        <StatTile label="Total Points"  value={userProfile.totalPoints || 0}        emoji="⭐" />
        <StatTile label="Activities"    value={userProfile.totalActivities || 0}     emoji="🏃" />
        <StatTile label="Calories Burned" value={(userProfile.totalCalories || 0).toLocaleString()} emoji="🔥" />
        <StatTile label="Day Streak"    value={userProfile.streak || 0}             emoji="⚡" />
        <StatTile label="Challenges Won" value={userProfile.challengeWins || 0}     emoji="🥇" />
        <StatTile label="Badges Earned" value={earnedBadges.length}                 emoji="🏅" />
      </View>

      {/* Badges */}
      {earnedBadges.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Badges & Achievements</Text>
          <View style={styles.badgesGrid}>
            {earnedBadges.map(b => (
              <View key={b.id} style={styles.badgeCard}>
                <Text style={styles.badgeEmoji}>{b.emoji}</Text>
                <Text style={styles.badgeName}>{b.name}</Text>
                <Text style={styles.badgeDesc}>{b.description}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {earnedBadges.length === 0 && (
        <View style={styles.noBadgesBox}>
          <Text style={styles.noBadgesText}>🏅 No badges yet — start logging activities to earn your first badge!</Text>
        </View>
      )}

      {/* Account Settings */}
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.settingsCard}>
        <SettingsRow label="📧  Email" value={userProfile.email} />
        <SettingsRow label="🎓  University" value={userProfile.university} />
        <SettingsRow label="📅  Member Since" value={
          userProfile.createdAt?.toDate
            ? new Date(userProfile.createdAt.toDate()).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
            : 'N/A'
        } />
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutBtn, loggingOut && { opacity: 0.6 }]}
        onPress={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut
          ? <ActivityIndicator color={COLORS.error} />
          : <Text style={styles.logoutText}>🚪  Log Out</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const StatTile = ({ label, value, emoji }) => (
  <View style={tileStyles.tile}>
    <Text style={tileStyles.emoji}>{emoji}</Text>
    <Text style={tileStyles.value}>{value}</Text>
    <Text style={tileStyles.label}>{label}</Text>
  </View>
);

const SettingsRow = ({ label, value }) => (
  <View style={settingStyles.row}>
    <Text style={settingStyles.label}>{label}</Text>
    <Text style={settingStyles.value}>{value}</Text>
  </View>
);

const tileStyles = StyleSheet.create({
  tile:  { width: '30%', backgroundColor: COLORS.white, borderRadius: 12, padding: 14, alignItems: 'center', elevation: 1 },
  emoji: { fontSize: 24 },
  value: { fontWeight: '800', fontSize: 18, color: COLORS.primary, marginTop: 6 },
  label: { fontSize: 11, color: COLORS.textMid, marginTop: 2, textAlign: 'center' },
});

const settingStyles = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F2F5' },
  label: { fontSize: 14, color: COLORS.textMid },
  value: { fontSize: 14, color: COLORS.textDark, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
});

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.bg },
  center:        { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileHeader: { alignItems: 'center', padding: 28, backgroundColor: COLORS.white, marginBottom: 16 },
  bigAvatar:     { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  bigInitial:    { color: '#fff', fontSize: 36, fontWeight: '800' },
  displayName:   { fontSize: 22, fontWeight: '800', color: COLORS.textDark },
  email:         { fontSize: 14, color: COLORS.textMid, marginTop: 4 },
  universityRow: { marginTop: 8 },
  universityText:{ fontSize: 14, color: COLORS.secondary, fontWeight: '600' },
  levelTag:      { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1, marginTop: 10 },
  levelTagText:  { fontWeight: '700', fontSize: 13 },
  xpCard:        { backgroundColor: COLORS.white, marginHorizontal: 16, borderRadius: 14, padding: 16, marginBottom: 8, elevation: 1 },
  xpRow:         { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  xpLabel:       { fontWeight: '700', color: COLORS.textDark },
  xpValue:       { fontWeight: '700', color: COLORS.secondary },
  progressBg:    { height: 8, backgroundColor: '#E8EDF5', borderRadius: 4, overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 4 },
  xpNext:        { fontSize: 12, color: COLORS.textMid, marginTop: 6 },
  sectionTitle:  { fontSize: 16, fontWeight: '700', color: COLORS.textDark, paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
  statsGrid:     { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, justifyContent: 'space-between' },
  badgesGrid:    { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8 },
  badgeCard:     { width: '30%', backgroundColor: COLORS.white, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#F9CA24', elevation: 1 },
  badgeEmoji:    { fontSize: 28 },
  badgeName:     { fontWeight: '700', fontSize: 11, color: COLORS.textDark, marginTop: 4, textAlign: 'center' },
  badgeDesc:     { fontSize: 10, color: COLORS.textMid, marginTop: 2, textAlign: 'center' },
  noBadgesBox:   { margin: 16, backgroundColor: '#FFF9E6', borderRadius: 12, padding: 16 },
  noBadgesText:  { color: '#7D6608', fontSize: 14, textAlign: 'center' },
  settingsCard:  { backgroundColor: COLORS.white, marginHorizontal: 16, borderRadius: 14, paddingHorizontal: 16, marginBottom: 8, elevation: 1 },
  logoutBtn:     { margin: 16, backgroundColor: '#FADBD8', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E74C3C' },
  logoutText:    { color: COLORS.error, fontWeight: '700', fontSize: 15 },
});
