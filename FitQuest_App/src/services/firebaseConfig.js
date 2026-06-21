// src/services/firebaseConfig.js
// ============================================================
//  FitQuest – Firebase Configuration & Service Initialisation
//  Caleb University Final Year Project
// ============================================================

import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import functions from '@react-native-firebase/functions';
import messaging from '@react-native-firebase/messaging';

// ── Firestore collection references ─────────────────────────
export const Collections = {
  USERS: 'users',
  ACTIVITIES: 'activities',
  BADGES: 'badges',
  LEADERBOARDS: 'leaderboards',
  CHALLENGES: 'challenges',
  NOTIFICATIONS: 'notifications',
};

// ── Auth helpers ─────────────────────────────────────────────
export const firebaseAuth = auth;

export const registerUser = async (email, password, displayName) => {
  const userCredential = await auth().createUserWithEmailAndPassword(email, password);
  await userCredential.user.updateProfile({ displayName });
  await userCredential.user.sendEmailVerification();
  return userCredential.user;
};

export const loginUser = (email, password) =>
  auth().signInWithEmailAndPassword(email, password);

export const logoutUser = () => auth().signOut();

export const resetPassword = (email) =>
  auth().sendPasswordResetEmail(email);

// ── Firestore helpers ────────────────────────────────────────
export const db = firestore;

export const createUserDocument = async (uid, data) => {
  await firestore().collection(Collections.USERS).doc(uid).set({
    uid,
    displayName: data.displayName,
    email: data.email,
    profilePhoto: '',
    university: data.university || 'Caleb University',
    createdAt: firestore.FieldValue.serverTimestamp(),
    totalPoints: 0,
    weeklyPoints: 0,
    level: 1,
    currentXP: 0,
    streak: 0,
    lastActivityDate: null,
    badgesEarned: [],
    friendIds: [],
  });
};

export const getUserDocument = (uid) =>
  firestore().collection(Collections.USERS).doc(uid);

export const updateUserPoints = (uid, pointsToAdd) =>
  firestore()
    .collection(Collections.USERS)
    .doc(uid)
    .update({
      totalPoints: firestore.FieldValue.increment(pointsToAdd),
      weeklyPoints: firestore.FieldValue.increment(pointsToAdd),
      currentXP: firestore.FieldValue.increment(pointsToAdd),
    });

// ── Activity helpers ─────────────────────────────────────────
export const logActivity = async (userId, activityData) => {
  const docRef = await firestore().collection(Collections.ACTIVITIES).add({
    userId,
    ...activityData,
    timestamp: firestore.FieldValue.serverTimestamp(),
    verified: false,
  });
  return docRef.id;
};

export const getUserActivities = (userId) =>
  firestore()
    .collection(Collections.ACTIVITIES)
    .where('userId', '==', userId)
    .orderBy('timestamp', 'desc');

// ── Leaderboard helpers ──────────────────────────────────────
export const getWeeklyLeaderboard = () =>
  firestore()
    .collection(Collections.LEADERBOARDS)
    .doc('weekly')
    .collection('entries')
    .orderBy('points', 'desc')
    .limit(50);

export const getAllTimeLeaderboard = () =>
  firestore()
    .collection(Collections.LEADERBOARDS)
    .doc('allTime')
    .collection('entries')
    .orderBy('points', 'desc')
    .limit(50);

// ── Challenge helpers ────────────────────────────────────────
export const createChallenge = (challengeData) =>
  firestore().collection(Collections.CHALLENGES).add({
    ...challengeData,
    createdAt: firestore.FieldValue.serverTimestamp(),
    status: 'active',
  });

export const getUserChallenges = (userId) =>
  firestore()
    .collection(Collections.CHALLENGES)
    .where('participants', 'array-contains', userId)
    .where('status', '==', 'active');

// ── Storage helpers ──────────────────────────────────────────
export const firebaseStorage = storage;

export const uploadProfilePhoto = async (uid, uri) => {
  const reference = storage().ref(`profilePhotos/${uid}.jpg`);
  await reference.putFile(uri);
  return reference.getDownloadURL();
};

// ── Cloud Functions ──────────────────────────────────────────
export const cloudFunctions = functions;

export const callBadgeEvaluation = (userId) =>
  functions().httpsCallable('evaluateBadges')({ userId });

// ── FCM Push Notifications ───────────────────────────────────
export const requestNotificationPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  if (enabled) {
    const token = await messaging().getToken();
    return token;
  }
  return null;
};

export default {
  auth: firebaseAuth,
  db,
  storage: firebaseStorage,
  functions: cloudFunctions,
  Collections,
};
