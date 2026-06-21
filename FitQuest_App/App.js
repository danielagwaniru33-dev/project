// App.js
// ============================================================
//  FitQuest – Gamified Health & Fitness Application
//  Caleb University · Department of Computer Science
//  Final Year Project 2024/2025
// ============================================================

import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" backgroundColor="#1A3A5C" />
      <AppNavigator />
    </AuthProvider>
  );
}
