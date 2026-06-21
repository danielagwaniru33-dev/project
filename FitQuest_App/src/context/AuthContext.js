// src/context/AuthContext.js
// ============================================================
//  FitQuest – Authentication Context Provider
// ============================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import auth from '@react-native-firebase/auth';
import { createUserDocument, getUserDocument, requestNotificationPermission } from '../services/firebaseConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [initialising, setInitialising] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Subscribe to real-time profile updates
        const unsubscribeProfile = getUserDocument(firebaseUser.uid)
          .onSnapshot(doc => {
            if (doc.exists) setUserProfile({ id: doc.id, ...doc.data() });
          });
        await requestNotificationPermission();
        return () => unsubscribeProfile();
      } else {
        setUserProfile(null);
      }
      if (initialising) setInitialising(false);
    });
    return unsubscribeAuth;
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, initialising, setUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
