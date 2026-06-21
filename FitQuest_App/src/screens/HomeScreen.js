// src/screens/HomeScreen.js
// ============================================================
//  FitQuest – Home Dashboard Screen
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getUserActivities } from '../services/firebaseConfig';
import { getLevelFromXP, getXPProgressToNextLevel, BADGES, getStreakMultiplier } from '../utils/gamificationUtils';
import moment from 'moment';

const COLORS = {
  primary:   '#1A3A5C',
  secondary: '#2E5FA3',
  accent:    '#27AE60',
  orange:    '#E67E22',
  bg:        '#F4F7FB',
  white:     '#FFFFFF',
  textDark:  '#1A1A2E',
  textMid:   '#666688',
  card:      '#FFFFFF',
};

export default function HomeScreen({ navigation }) {
  const { userProfile } = useAuth();
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [refreshing, setRefreshing]             = useState(false);

  const levelInfo    = userProfile ? getLevelFromXP(userProfile.currentXP || 0) : null;
  const xpProgress   = userProfile ? getXPProgressToNextLevel(userProfile.currentXP || 0) : null;
  const multiplier   = userProfile ? getStreakMultiplier(userProfile.streak || 0) : 1;

  const fetchActivities = async () => {
    if (!userProfile) return;
    try {
      const snap = await getUserActivities(userProfile.uid).limit(5).get();
      setRecentActivities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.warn(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchActivities(); }, [userProfile]);

  const earnedBadges = userProfile
    ? BADGES.filter(b => (userProfile.badgesEarned || []).includes(b.id)).slice(0, 4)
    : [];

  if (!userProfile) return (
    <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primary} /></View>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchActivities(); }} />}
    >
      {/* Header Greeting */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good {getTimeOfDay()},</Text>
          <Text style={styles.name}>{userProfile.displayName?.split(' ')[0]} 👋</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{userProfile.displayName?.[0]?.toUpperCase()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Level & XP Card */}
      <View style={styles.levelCard}>
        <View style={styles.levelRow}>
          <View style={[styles.levelBadge, { backgroundColor: levelInfo?.color || COLORS.secondary }]}>
            <Text style={styles.levelNum}>Lv.{levelInfo?.level}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.levelTitle}>{levelInfo?.title}</Text>
            <Text style={styles.xpText}>
              {xpProgress?.nextLevel
                ? `${xpProgress.remaining} XP to ${xpProgress.nextLevel.title}`
                : 'Maximum Level Reached!'}
            </Text>
          </View>
          <Text style={styles.totalXP}>{userProfile.totalPoints || 0} pts</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${xpProgress?.percentage || 0}%` }]} />
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard emoji="🔥" value={userProfile.streak || 0} label="Day Streak" color="#E67E22" />
        <StatCard emoji="⚡" value={`${multiplier}×`} label="Multiplier" color="#9B59B6" />
        <StatCard emoji="🏅" value={(userProfile.badgesEarned || []).length} label="Badges" color="#27AE60" />
        <StatCard emoji="💯" value={userProfile.weeklyPoints || 0} label="This Week" color="#2E5FA3" />
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsRow}>
        <ActionBtn emoji="🏃" label="Log Activity"   onPress={() => navigation.navigate('Activity')}    color={COLORS.accent} />
        <ActionBtn emoji="🏆" label="Leaderboard"    onPress={() => navigation.navigate('Leaderboard')} color={COLORS.secondary} />
        <ActionBtn emoji="⚔️"  label="Challenge"     onPress={() => navigation.navigate('Challenges')}  color={COLORS.orange} />
        <ActionBtn emoji="📊" label="Progress"       onPress={() => navigation.navigate('Progress')}    color="#9B59B6" />
      </View>

      {/* Recent Badges */}
      {earnedBadges.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent Badges</Text>
          <View style={styles.badgesRow}>
            {earnedBadges.map(b => (
              <View key={b.id} style={styles.badgeChip}>
                <Text style={styles.badgeEmoji}>{b.emoji}</Text>
                <Text style={styles.badgeName}>{b.name}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Recent Activity */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {loading
        ? <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 20 }} />
        : recentActivities.length === 0
          ? <Text style={styles.emptyText}>No activities yet. Log your first workout! 💪</Text>
          : recentActivities.map(a => (
              <View key={a.id} style={styles.activityItem}>
                <Text style={styles.activityIcon}>{a.icon || '🏅'}</Text>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.activityType}>{a.activityType}</Text>
                  <Text style={styles.activityMeta}>
                    {a.duration}min · {a.caloriesBurned} kcal · {moment(a.timestamp?.toDate()).fromNow()}
                  </Text>
                </View>
                <View style={styles.pointsBadge}>
                  <Text style={styles.pointsText}>+{a.pointsEarned} XP</Text>
                </View>
              </View>
            ))
      }

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ── Sub-components ──────────────────────────────────────────
const StatCard = ({ emoji, value, label, color }) => (
  <View style={[styles.statCard, { borderTopColor: color, borderTopWidth: 3 }]}>
    <Text style={styles.statEmoji}>{emoji}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ActionBtn = ({ emoji, label, onPress, color }) => (
  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: color }]} onPress={onPress}>
    <Text style={styles.actionEmoji}>{emoji}</Text>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const getTimeOfDay = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
};

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: COLORS.bg },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingBottom: 12 },
  greeting:       { fontSize: 14, color: COLORS.textMid },
  name:           { fontSize: 26, fontWeight: '800', color: COLORS.primary },
  avatarCircle:   { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center' },
  avatarInitial:  { color: '#fff', fontSize: 20, fontWeight: '700' },
  levelCard:      { margin: 16, marginTop: 8, backgroundColor: COLORS.white, borderRadius: 16, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  levelRow:       { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  levelBadge:     { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  levelNum:       { color: '#fff', fontWeight: '800', fontSize: 14 },
  levelTitle:     { fontWeight: '700', fontSize: 16, color: COLORS.textDark },
  xpText:         { fontSize: 12, color: COLORS.textMid, marginTop: 2 },
  totalXP:        { fontWeight: '800', fontSize: 18, color: COLORS.primary },
  progressBarBg:  { height: 8, backgroundColor: '#E8EDF5', borderRadius: 4, overflow: 'hidden' },
  progressBarFill:{ height: '100%', backgroundColor: COLORS.accent, borderRadius: 4 },
  statsRow:       { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  statCard:       { flex: 1, backgroundColor: COLORS.white, borderRadius: 12, padding: 10, alignItems: 'center', elevation: 2 },
  statEmoji:      { fontSize: 20 },
  statValue:      { fontWeight: '800', fontSize: 16, marginTop: 2 },
  statLabel:      { fontSize: 10, color: COLORS.textMid, marginTop: 2 },
  sectionTitle:   { fontSize: 16, fontWeight: '700', color: COLORS.textDark, paddingHorizontal: 16, marginTop: 16, marginBottom: 8 },
  actionsRow:     { flexDirection: 'row', paddingHorizontal: 16, gap: 8 },
  actionBtn:      { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center', gap: 4 },
  actionEmoji:    { fontSize: 22 },
  actionLabel:    { color: '#fff', fontSize: 11, fontWeight: '600' },
  badgesRow:      { flexDirection: 'row', paddingHorizontal: 16, flexWrap: 'wrap', gap: 8 },
  badgeChip:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9E6', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#F9CA24', gap: 6 },
  badgeEmoji:     { fontSize: 18 },
  badgeName:      { fontSize: 12, fontWeight: '600', color: COLORS.textDark },
  activityItem:   { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 14, elevation: 1 },
  activityIcon:   { fontSize: 28 },
  activityType:   { fontWeight: '700', fontSize: 14, color: COLORS.textDark, textTransform: 'capitalize' },
  activityMeta:   { fontSize: 12, color: COLORS.textMid, marginTop: 2 },
  pointsBadge:    { backgroundColor: '#EBF9F1', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  pointsText:     { color: COLORS.accent, fontWeight: '700', fontSize: 13 },
  emptyText:      { textAlign: 'center', color: COLORS.textMid, padding: 24, fontSize: 14 },
});
