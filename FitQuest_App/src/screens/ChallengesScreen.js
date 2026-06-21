// src/screens/ChallengesScreen.js
// ============================================================
//  FitQuest – Group Challenges Screen
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Modal, Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { createChallenge, getUserChallenges, db, Collections } from '../services/firebaseConfig';
import firestore from '@react-native-firebase/firestore';
import moment from 'moment';

const COLORS = {
  primary: '#1A3A5C', secondary: '#2E5FA3', accent: '#27AE60',
  orange: '#E67E22', bg: '#F4F7FB', white: '#FFFFFF',
  textDark: '#1A1A2E', textMid: '#666688', border: '#D0D7E3', error: '#E74C3C',
};

const CHALLENGE_TYPES = [
  { key: 'steps',    label: 'Total Steps',    emoji: '👟', unit: 'steps' },
  { key: 'calories', label: 'Calories Burned',emoji: '🔥', unit: 'kcal'  },
  { key: 'distance', label: 'Total Distance', emoji: '📍', unit: 'km'    },
  { key: 'sessions', label: 'Activity Count', emoji: '💪', unit: 'sessions'},
];

export default function ChallengesScreen() {
  const { userProfile } = useAuth();
  const [challenges, setChallenges]   = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showCreate, setShowCreate]   = useState(false);

  // Form state
  const [title, setTitle]           = useState('');
  const [targetType, setTargetType] = useState('sessions');
  const [targetValue, setTargetValue] = useState('');
  const [endDays, setEndDays]       = useState('7');
  const [creating, setCreating]     = useState(false);

  useEffect(() => {
    if (!userProfile) return;
    const unsub = getUserChallenges(userProfile.uid)
      .onSnapshot(snap => {
        setChallenges(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      });
    return unsub;
  }, [userProfile]);

  const handleCreate = async () => {
    if (!title.trim())     { Alert.alert('Missing', 'Enter a challenge title.'); return; }
    if (!targetValue || isNaN(Number(targetValue)))
      { Alert.alert('Missing', 'Enter a valid target value.'); return; }

    setCreating(true);
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + Number(endDays));

      await createChallenge({
        title:        title.trim(),
        createdBy:    userProfile.uid,
        creatorName:  userProfile.displayName,
        participants: [userProfile.uid],
        targetType,
        targetValue:  Number(targetValue),
        startDate:    firestore.FieldValue.serverTimestamp(),
        endDate:      endDate.toISOString(),
        status:       'active',
        progress:     { [userProfile.uid]: 0 },
      });
      setShowCreate(false);
      setTitle(''); setTargetValue(''); setEndDays('7');
      Alert.alert('Challenge Created!', 'Invite friends to join your challenge.');
    } catch (e) {
      Alert.alert('Error', 'Failed to create challenge.');
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>⚔️ Challenges</Text>
          <Text style={styles.sub}>Compete in group fitness challenges</Text>
        </View>
        <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreate(true)}>
          <Text style={styles.createBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : challenges.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🏁</Text>
            <Text style={styles.emptyTitle}>No Active Challenges</Text>
            <Text style={styles.emptyText}>Create a challenge and invite your friends to compete!</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowCreate(true)}>
              <Text style={styles.emptyBtnText}>Create Challenge</Text>
            </TouchableOpacity>
          </View>
        ) : (
          challenges.map(ch => <ChallengeCard key={ch.id} challenge={ch} userId={userProfile?.uid} />)
        )}
      </ScrollView>

      {/* Create Challenge Modal */}
      <Modal visible={showCreate} animationType="slide" transparent onRequestClose={() => setShowCreate(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create Challenge</Text>

            <Text style={styles.formLabel}>Challenge Title</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle}
              placeholder="e.g. 7-Day Step Challenge" placeholderTextColor={COLORS.textMid} />

            <Text style={styles.formLabel}>Challenge Type</Text>
            <View style={styles.typeRow}>
              {CHALLENGE_TYPES.map(t => (
                <TouchableOpacity
                  key={t.key}
                  style={[styles.typeBtn, targetType === t.key && styles.typeBtnActive]}
                  onPress={() => setTargetType(t.key)}
                >
                  <Text style={styles.typeEmoji}>{t.emoji}</Text>
                  <Text style={[styles.typeLabel, targetType === t.key && { color: COLORS.primary, fontWeight: '700' }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>
              Target ({CHALLENGE_TYPES.find(t => t.key === targetType)?.unit})
            </Text>
            <TextInput style={styles.input} value={targetValue} onChangeText={setTargetValue}
              placeholder="e.g. 50000" keyboardType="numeric" placeholderTextColor={COLORS.textMid} />

            <Text style={styles.formLabel}>Duration (days)</Text>
            <View style={styles.daysRow}>
              {['3', '7', '14', '30'].map(d => (
                <TouchableOpacity key={d} style={[styles.dayBtn, endDays === d && styles.dayBtnActive]}
                  onPress={() => setEndDays(d)}>
                  <Text style={[styles.dayBtnText, endDays === d && { color: '#fff' }]}>{d}d</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCreate(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, creating && { opacity: 0.6 }]}
                onPress={handleCreate} disabled={creating}>
                {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmText}>Create 🚀</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const ChallengeCard = ({ challenge, userId }) => {
  const myProgress = challenge.progress?.[userId] || 0;
  const progressPct = Math.min(100, Math.round((myProgress / challenge.targetValue) * 100));
  const daysLeft = moment(challenge.endDate).diff(moment(), 'days');
  const typeInfo = CHALLENGE_TYPES.find(t => t.key === challenge.targetType) || CHALLENGE_TYPES[0];

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.top}>
        <Text style={cardStyles.emoji}>{typeInfo.emoji}</Text>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={cardStyles.title}>{challenge.title}</Text>
          <Text style={cardStyles.meta}>
            by {challenge.creatorName} · {challenge.participants?.length || 1} participant{challenge.participants?.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={[cardStyles.statusBadge, daysLeft <= 0 && { backgroundColor: '#FADBD8' }]}>
          <Text style={[cardStyles.statusText, daysLeft <= 0 && { color: '#C0392B' }]}>
            {daysLeft > 0 ? `${daysLeft}d left` : 'Ended'}
          </Text>
        </View>
      </View>
      <View style={cardStyles.progressSection}>
        <View style={cardStyles.progressInfo}>
          <Text style={cardStyles.progressLabel}>Your Progress</Text>
          <Text style={cardStyles.progressValue}>
            {myProgress.toLocaleString()} / {challenge.targetValue.toLocaleString()} {typeInfo.unit}
          </Text>
        </View>
        <View style={cardStyles.bar}>
          <View style={[cardStyles.fill, { width: `${progressPct}%` }]} />
        </View>
        <Text style={cardStyles.pct}>{progressPct}% complete</Text>
      </View>
    </View>
  );
};

const cardStyles = StyleSheet.create({
  card:          { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 12, elevation: 2 },
  top:           { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  emoji:         { fontSize: 28 },
  title:         { fontWeight: '700', fontSize: 15, color: COLORS.textDark },
  meta:          { fontSize: 12, color: COLORS.textMid, marginTop: 2 },
  statusBadge:   { backgroundColor: '#EBF9F1', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusText:    { fontSize: 12, color: COLORS.accent, fontWeight: '600' },
  progressSection:{ },
  progressInfo:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 12, color: COLORS.textMid },
  progressValue: { fontSize: 12, fontWeight: '700', color: COLORS.textDark },
  bar:           { height: 8, backgroundColor: '#E8EDF5', borderRadius: 4, overflow: 'hidden' },
  fill:          { height: '100%', backgroundColor: COLORS.accent, borderRadius: 4 },
  pct:           { fontSize: 11, color: COLORS.textMid, marginTop: 4, textAlign: 'right' },
});

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: COLORS.bg },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12, backgroundColor: COLORS.primary },
  title:        { fontSize: 24, fontWeight: '800', color: COLORS.white },
  sub:          { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  createBtn:    { backgroundColor: COLORS.orange, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 },
  createBtnText:{ color: '#fff', fontWeight: '700' },
  emptyBox:     { alignItems: 'center', padding: 40 },
  emptyEmoji:   { fontSize: 48, marginBottom: 12 },
  emptyTitle:   { fontSize: 18, fontWeight: '700', color: COLORS.textDark, marginBottom: 8 },
  emptyText:    { fontSize: 14, color: COLORS.textMid, textAlign: 'center', marginBottom: 20 },
  emptyBtn:     { backgroundColor: COLORS.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnText: { color: '#fff', fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard:    { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle:   { fontSize: 20, fontWeight: '800', color: COLORS.primary, marginBottom: 16 },
  formLabel:    { fontSize: 13, fontWeight: '700', color: COLORS.textDark, marginBottom: 6, marginTop: 8 },
  input:        { backgroundColor: COLORS.bg, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: COLORS.textDark, marginBottom: 4 },
  typeRow:      { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 4 },
  typeBtn:      { flex: 1, minWidth: '45%', backgroundColor: COLORS.bg, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  typeBtnActive:{ borderColor: COLORS.primary, backgroundColor: '#EBF2FB' },
  typeEmoji:    { fontSize: 20 },
  typeLabel:    { fontSize: 11, color: COLORS.textMid, marginTop: 4, textAlign: 'center' },
  daysRow:      { flexDirection: 'row', gap: 8, marginBottom: 8 },
  dayBtn:       { flex: 1, backgroundColor: COLORS.bg, borderRadius: 8, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  dayBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dayBtnText:   { fontWeight: '600', color: COLORS.textDark },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelBtn:    { flex: 1, backgroundColor: COLORS.bg, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  cancelText:   { color: COLORS.textMid, fontWeight: '600' },
  confirmBtn:   { flex: 2, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  confirmText:  { color: '#fff', fontWeight: '700', fontSize: 15 },
});
