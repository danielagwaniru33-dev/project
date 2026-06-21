// src/screens/ActivityScreen.js
// ============================================================
//  FitQuest – Fitness Activity Logging Screen
// ============================================================

import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { logActivity, getUserDocument } from '../services/firebaseConfig';
import {
  ACTIVITY_TYPES, calculateCalories, calculatePoints,
  calculateStreak, evaluateNewBadges, getLevelFromXP,
} from '../utils/gamificationUtils';
import firestore from '@react-native-firebase/firestore';

const COLORS = {
  primary: '#1A3A5C', secondary: '#2E5FA3', accent: '#27AE60',
  orange: '#E67E22', bg: '#F4F7FB', white: '#FFFFFF',
  textDark: '#1A1A2E', textMid: '#666688', border: '#D0D7E3', error: '#E74C3C',
};

export default function ActivityScreen() {
  const { userProfile } = useAuth();
  const [selectedType, setSelectedType] = useState(null);
  const [duration, setDuration]         = useState('');
  const [distance, setDistance]         = useState('');
  const [notes, setNotes]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [reward, setReward]             = useState(null); // for reward modal

  const weight = userProfile?.weightKg || 70;

  const preview = selectedType && duration
    ? {
        calories: calculateCalories(selectedType, Number(duration), weight),
        points:   calculatePoints(selectedType, Number(duration), userProfile?.streak || 0),
      }
    : null;

  const handleLogActivity = async () => {
    if (!selectedType)      { Alert.alert('Missing', 'Please select an activity type.'); return; }
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0)
      { Alert.alert('Missing', 'Please enter a valid duration.'); return; }

    setLoading(true);
    try {
      const caloriesBurned = calculateCalories(selectedType, Number(duration), weight);
      const pointsEarned   = calculatePoints(selectedType, Number(duration), userProfile?.streak || 0);
      const activityData   = {
        activityType:    selectedType,
        label:           ACTIVITY_TYPES[selectedType].label,
        icon:            ACTIVITY_TYPES[selectedType].icon,
        duration:        Number(duration),
        distance:        distance ? Number(distance) : 0,
        caloriesBurned,
        pointsEarned,
        notes,
        date:            new Date().toISOString().split('T')[0],
      };

      await logActivity(userProfile.uid, activityData);

      // Update user document — points, streak, XP
      const newStreak = calculateStreak(userProfile.lastActivityDate, userProfile.streak || 0);
      const updatedXP = (userProfile.currentXP || 0) + pointsEarned;
      const newLevel  = getLevelFromXP(updatedXP);

      // Check new badges
      const updatedStats = {
        totalActivities:  (userProfile.totalActivities || 0) + 1,
        totalCalories:    (userProfile.totalCalories || 0) + caloriesBurned,
        streak:           newStreak,
        activityCounts:   {
          ...(userProfile.activityCounts || {}),
          [selectedType]: ((userProfile.activityCounts?.[selectedType] || 0) + 1),
        },
        hasEarlyActivity: new Date().getHours() < 7,
        hasLateActivity:  new Date().getHours() >= 22,
        challengesJoined: userProfile.challengesJoined || 0,
        challengeWins:    userProfile.challengeWins || 0,
        friendCount:      (userProfile.friendIds || []).length,
      };
      const newBadges = evaluateNewBadges(updatedStats, userProfile.badgesEarned || []);

      await getUserDocument(userProfile.uid).update({
        totalPoints:      firestore.FieldValue.increment(pointsEarned),
        weeklyPoints:     firestore.FieldValue.increment(pointsEarned),
        currentXP:        firestore.FieldValue.increment(pointsEarned),
        streak:           newStreak,
        lastActivityDate: firestore.FieldValue.serverTimestamp(),
        totalActivities:  firestore.FieldValue.increment(1),
        totalCalories:    firestore.FieldValue.increment(caloriesBurned),
        level:            newLevel.level,
        activityCounts:   updatedStats.activityCounts,
        ...(newBadges.length > 0 && {
          badgesEarned: firestore.FieldValue.arrayUnion(...newBadges)
        }),
      });

      setReward({ pointsEarned, caloriesBurned, newBadges, newLevel, leveledUp: newLevel.level > userProfile.level });
      setSelectedType(null); setDuration(''); setDistance(''); setNotes('');
    } catch (e) {
      Alert.alert('Error', 'Failed to log activity. Please try again.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Text style={styles.pageTitle}>Log Activity</Text>
      <Text style={styles.pageSub}>Track your workout and earn XP points 🎯</Text>

      {/* Activity Type Selector */}
      <Text style={styles.sectionLabel}>Select Activity Type</Text>
      <View style={styles.typeGrid}>
        {Object.entries(ACTIVITY_TYPES).map(([key, val]) => (
          <TouchableOpacity
            key={key}
            style={[styles.typeCard, selectedType === key && styles.typeCardSelected]}
            onPress={() => setSelectedType(key)}
          >
            <Text style={styles.typeEmoji}>{val.icon}</Text>
            <Text style={[styles.typeLabel, selectedType === key && styles.typeLabelSelected]}>{val.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Duration */}
      <Text style={styles.sectionLabel}>Duration (minutes)</Text>
      <TextInput
        style={styles.input}
        value={duration}
        onChangeText={setDuration}
        placeholder="e.g. 30"
        keyboardType="numeric"
        placeholderTextColor={COLORS.textMid}
      />

      {/* Distance (optional) */}
      <Text style={styles.sectionLabel}>Distance — km (optional)</Text>
      <TextInput
        style={styles.input}
        value={distance}
        onChangeText={setDistance}
        placeholder="e.g. 5.2"
        keyboardType="decimal-pad"
        placeholderTextColor={COLORS.textMid}
      />

      {/* Notes */}
      <Text style={styles.sectionLabel}>Notes (optional)</Text>
      <TextInput
        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
        value={notes}
        onChangeText={setNotes}
        placeholder="How did it feel? Any achievements?"
        multiline
        placeholderTextColor={COLORS.textMid}
      />

      {/* Preview */}
      {preview && (
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Estimated Rewards</Text>
          <View style={styles.previewRow}>
            <View style={styles.previewItem}>
              <Text style={styles.previewEmoji}>⚡</Text>
              <Text style={styles.previewValue}>+{preview.points} XP</Text>
              <Text style={styles.previewLbl}>Points</Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={styles.previewEmoji}>🔥</Text>
              <Text style={styles.previewValue}>{preview.calories}</Text>
              <Text style={styles.previewLbl}>Calories</Text>
            </View>
            {(userProfile?.streak || 0) >= 3 && (
              <View style={styles.previewItem}>
                <Text style={styles.previewEmoji}>✨</Text>
                <Text style={styles.previewValue}>×{(userProfile?.streak >= 30 ? 2.0 : userProfile?.streak >= 7 ? 1.5 : 1.25)}</Text>
                <Text style={styles.previewLbl}>Streak Bonus</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, loading && { opacity: 0.6 }]}
        onPress={handleLogActivity}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.submitText}>🏅  Log Activity</Text>
        }
      </TouchableOpacity>

      {/* Reward Modal */}
      <Modal visible={!!reward} transparent animationType="fade" onRequestClose={() => setReward(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{reward?.leveledUp ? '🎉 Level Up!' : '✅ Activity Logged!'}</Text>
            {reward?.leveledUp && (
              <Text style={styles.levelUpText}>You reached a new level!</Text>
            )}
            <Text style={styles.modalPoints}>+{reward?.pointsEarned} XP earned</Text>
            <Text style={styles.modalCal}>🔥 {reward?.caloriesBurned} calories burned</Text>
            {reward?.newBadges?.length > 0 && (
              <View style={styles.newBadgesBox}>
                <Text style={styles.badgeTitle}>🏆 New Badge{reward.newBadges.length > 1 ? 's' : ''} Unlocked!</Text>
                {reward.newBadges.map(id => (
                  <Text key={id} style={styles.badgeItem}>{id.replace(/_/g, ' ')}</Text>
                ))}
              </View>
            )}
            <TouchableOpacity style={styles.modalBtn} onPress={() => setReward(null)}>
              <Text style={styles.modalBtnText}>Awesome! 💪</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: COLORS.bg },
  pageTitle:          { fontSize: 26, fontWeight: '800', color: COLORS.primary, marginBottom: 4 },
  pageSub:            { fontSize: 14, color: COLORS.textMid, marginBottom: 20 },
  sectionLabel:       { fontSize: 13, fontWeight: '700', color: COLORS.textDark, marginBottom: 8, marginTop: 4 },
  typeGrid:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeCard:           { width: '23%', backgroundColor: COLORS.white, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border },
  typeCardSelected:   { borderColor: COLORS.primary, backgroundColor: '#EBF2FB' },
  typeEmoji:          { fontSize: 24 },
  typeLabel:          { fontSize: 10, color: COLORS.textMid, marginTop: 4, textAlign: 'center' },
  typeLabelSelected:  { color: COLORS.primary, fontWeight: '700' },
  input:              { backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: COLORS.textDark, marginBottom: 16 },
  previewCard:        { backgroundColor: '#EBF9F1', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#A9DFBF' },
  previewTitle:       { fontWeight: '700', color: COLORS.accent, fontSize: 14, marginBottom: 10 },
  previewRow:         { flexDirection: 'row', justifyContent: 'space-around' },
  previewItem:        { alignItems: 'center' },
  previewEmoji:       { fontSize: 22 },
  previewValue:       { fontWeight: '800', fontSize: 18, color: COLORS.textDark, marginTop: 4 },
  previewLbl:         { fontSize: 11, color: COLORS.textMid },
  submitBtn:          { backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 18, alignItems: 'center' },
  submitText:         { color: '#fff', fontSize: 16, fontWeight: '700' },
  modalOverlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard:          { backgroundColor: COLORS.white, borderRadius: 20, padding: 28, width: '100%', alignItems: 'center' },
  modalTitle:         { fontSize: 24, fontWeight: '800', color: COLORS.primary, marginBottom: 8 },
  levelUpText:        { fontSize: 16, color: COLORS.orange, fontWeight: '700', marginBottom: 8 },
  modalPoints:        { fontSize: 32, fontWeight: '900', color: COLORS.accent, marginVertical: 8 },
  modalCal:           { fontSize: 15, color: COLORS.textMid },
  newBadgesBox:       { backgroundColor: '#FFF9E6', borderRadius: 12, padding: 12, marginTop: 12, width: '100%' },
  badgeTitle:         { fontWeight: '700', fontSize: 14, color: COLORS.orange, marginBottom: 4 },
  badgeItem:          { textTransform: 'capitalize', color: COLORS.textDark, fontSize: 13, marginTop: 2 },
  modalBtn:           { backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 40, marginTop: 16 },
  modalBtnText:       { color: '#fff', fontWeight: '700', fontSize: 16 },
});
