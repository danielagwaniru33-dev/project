// src/screens/LeaderboardScreen.js
// ============================================================
//  FitQuest – Leaderboard & Social Competition Screen
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, RefreshControl, Image,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getWeeklyLeaderboard, getAllTimeLeaderboard } from '../services/firebaseConfig';

const COLORS = {
  primary: '#1A3A5C', secondary: '#2E5FA3', accent: '#27AE60',
  orange: '#E67E22', bg: '#F4F7FB', white: '#FFFFFF',
  textDark: '#1A1A2E', textMid: '#666688', gold: '#F9CA24', silver: '#BDC3C7', bronze: '#E59866',
};

const RANK_COLORS = { 1: COLORS.gold, 2: COLORS.silver, 3: COLORS.bronze };
const RANK_EMOJI  = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function LeaderboardScreen() {
  const { userProfile } = useAuth();
  const [tab, setTab]         = useState('weekly'); // 'weekly' | 'allTime'
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const query = tab === 'weekly' ? getWeeklyLeaderboard() : getAllTimeLeaderboard();
      const snap  = await query.get();
      setEntries(snap.docs.map((d, i) => ({ id: d.id, rank: i + 1, ...d.data() })));
    } catch (e) { console.warn(e); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { fetchLeaderboard(); }, [tab]);

  const myRank = entries.findIndex(e => e.userId === userProfile?.uid) + 1;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Leaderboard</Text>
        <Text style={styles.sub}>Compete with fellow Caleb University students</Text>
      </View>

      {/* Tab Toggle */}
      <View style={styles.tabRow}>
        {['weekly', 'allTime'].map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'weekly' ? '📅 Weekly' : '🌟 All Time'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* My Rank Banner */}
      {myRank > 0 && (
        <View style={styles.myRankBanner}>
          <Text style={styles.myRankText}>
            Your current rank: <Text style={{ color: COLORS.orange, fontWeight: '800' }}>#{myRank}</Text>
          </Text>
        </View>
      )}

      {/* Podium Top 3 */}
      {!loading && entries.length >= 3 && (
        <View style={styles.podium}>
          {/* 2nd */}
          <PodiumCard entry={entries[1]} rank={2} height={80} />
          {/* 1st */}
          <PodiumCard entry={entries[0]} rank={1} height={110} />
          {/* 3rd */}
          <PodiumCard entry={entries[2]} rank={3} height={60} />
        </View>
      )}

      {/* Full List */}
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchLeaderboard(); }} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : entries.length === 0 ? (
          <Text style={styles.emptyText}>No entries yet. Be the first! 🚀</Text>
        ) : (
          entries.slice(3).map((entry) => (
            <LeaderboardRow key={entry.id} entry={entry} isMe={entry.userId === userProfile?.uid} />
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ── Podium Card ──────────────────────────────────────────────
const PodiumCard = ({ entry, rank, height }) => (
  <View style={styles.podiumItem}>
    <Text style={styles.podiumEmoji}>{RANK_EMOJI[rank]}</Text>
    <View style={[styles.podiumAvatar, { backgroundColor: RANK_COLORS[rank] }]}>
      <Text style={styles.podiumInitial}>{(entry?.displayName || '?')[0].toUpperCase()}</Text>
    </View>
    <Text style={styles.podiumName} numberOfLines={1}>{entry?.displayName?.split(' ')[0] || 'N/A'}</Text>
    <View style={[styles.podiumBar, { height, backgroundColor: RANK_COLORS[rank] + '33', borderTopColor: RANK_COLORS[rank] }]}>
      <Text style={[styles.podiumPts, { color: RANK_COLORS[rank] === COLORS.gold ? '#7D6608' : COLORS.textDark }]}>
        {entry?.points || 0}
      </Text>
      <Text style={styles.podiumPtLbl}>pts</Text>
    </View>
  </View>
);

// ── List Row ─────────────────────────────────────────────────
const LeaderboardRow = ({ entry, isMe }) => (
  <View style={[styles.row, isMe && styles.rowMe]}>
    <Text style={styles.rowRank}>#{entry.rank}</Text>
    <View style={styles.rowAvatar}>
      <Text style={styles.rowInitial}>{(entry.displayName || '?')[0].toUpperCase()}</Text>
    </View>
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Text style={[styles.rowName, isMe && { color: COLORS.primary }]}>
        {entry.displayName} {isMe ? '(You)' : ''}
      </Text>
      <Text style={styles.rowUniversity}>{entry.university || 'Caleb University'}</Text>
    </View>
    <Text style={styles.rowPts}>{entry.points || 0} pts</Text>
  </View>
);

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: COLORS.bg },
  header:          { padding: 20, paddingBottom: 8, backgroundColor: COLORS.primary },
  title:           { fontSize: 24, fontWeight: '800', color: COLORS.white },
  sub:             { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  tabRow:          { flexDirection: 'row', backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  tab:             { flex: 1, paddingVertical: 8, borderRadius: 20, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)' },
  tabActive:       { backgroundColor: COLORS.white },
  tabText:         { color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  tabTextActive:   { color: COLORS.primary, fontWeight: '700' },
  myRankBanner:    { backgroundColor: '#EBF9F1', padding: 10, alignItems: 'center' },
  myRankText:      { fontSize: 13, color: COLORS.textDark },
  podium:          { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 8, backgroundColor: COLORS.white, marginBottom: 8 },
  podiumItem:      { flex: 1, alignItems: 'center' },
  podiumEmoji:     { fontSize: 24, marginBottom: 4 },
  podiumAvatar:    { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  podiumInitial:   { color: '#fff', fontWeight: '800', fontSize: 18 },
  podiumName:      { fontSize: 11, fontWeight: '600', color: COLORS.textDark, marginBottom: 4 },
  podiumBar:       { width: '100%', borderTopWidth: 3, borderRadius: 8, justifyContent: 'center', alignItems: 'center', paddingTop: 8 },
  podiumPts:       { fontWeight: '800', fontSize: 16 },
  podiumPtLbl:     { fontSize: 10, color: COLORS.textMid },
  row:             { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, marginHorizontal: 16, marginBottom: 6, borderRadius: 12, padding: 12, elevation: 1 },
  rowMe:           { borderWidth: 1.5, borderColor: COLORS.accent },
  rowRank:         { width: 32, fontWeight: '700', color: COLORS.textMid, fontSize: 13 },
  rowAvatar:       { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center' },
  rowInitial:      { color: '#fff', fontWeight: '700' },
  rowName:         { fontWeight: '600', fontSize: 14, color: COLORS.textDark },
  rowUniversity:   { fontSize: 11, color: COLORS.textMid },
  rowPts:          { fontWeight: '800', color: COLORS.primary },
  emptyText:       { textAlign: 'center', color: COLORS.textMid, padding: 40 },
});
