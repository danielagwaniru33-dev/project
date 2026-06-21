// src/utils/gamificationUtils.js
// ============================================================
//  FitQuest – Gamification Engine Utilities
//  Points, XP, Level Calculation, Badge Logic, Streaks
// ============================================================

// ── Activity Type Configuration ──────────────────────────────
export const ACTIVITY_TYPES = {
  running:     { label: 'Running',       met: 9.8,  basePoints: 50, icon: '🏃' },
  walking:     { label: 'Walking',       met: 3.5,  basePoints: 15, icon: '🚶' },
  cycling:     { label: 'Cycling',       met: 7.5,  basePoints: 35, icon: '🚴' },
  swimming:    { label: 'Swimming',      met: 8.0,  basePoints: 40, icon: '🏊' },
  gym:         { label: 'Gym Workout',   met: 6.0,  basePoints: 30, icon: '🏋️' },
  yoga:        { label: 'Yoga',          met: 2.5,  basePoints: 10, icon: '🧘' },
  hiit:        { label: 'HIIT',          met: 11.0, basePoints: 60, icon: '⚡' },
  basketball:  { label: 'Basketball',    met: 6.5,  basePoints: 35, icon: '🏀' },
  football:    { label: 'Football',      met: 7.0,  basePoints: 35, icon: '⚽' },
  dancing:     { label: 'Dancing',       met: 4.5,  basePoints: 20, icon: '💃' },
  rope:        { label: 'Jump Rope',     met: 10.0, basePoints: 45, icon: '🪃' },
  custom:      { label: 'Custom',        met: 4.0,  basePoints: 20, icon: '🏅' },
};

// ── Level Configuration ───────────────────────────────────────
export const LEVELS = [
  { level: 1,  title: 'Beginner',    minXP: 0,      color: '#95A5A6' },
  { level: 2,  title: 'Active',      minXP: 100,    color: '#3498DB' },
  { level: 3,  title: 'Motivated',   minXP: 400,    color: '#2ECC71' },
  { level: 4,  title: 'Committed',   minXP: 900,    color: '#1ABC9C' },
  { level: 5,  title: 'Fit',         minXP: 1600,   color: '#27AE60' },
  { level: 6,  title: 'Strong',      minXP: 2500,   color: '#F39C12' },
  { level: 7,  title: 'Dedicated',   minXP: 3600,   color: '#E67E22' },
  { level: 8,  title: 'Athlete',     minXP: 4900,   color: '#E74C3C' },
  { level: 9,  title: 'Competitor',  minXP: 6400,   color: '#C0392B' },
  { level: 10, title: 'Champion',    minXP: 8100,   color: '#9B59B6' },
  { level: 11, title: 'Elite',       minXP: 10000,  color: '#8E44AD' },
  { level: 12, title: 'Pro',         minXP: 12100,  color: '#2C3E50' },
  { level: 13, title: 'Expert',      minXP: 14400,  color: '#1A252F' },
  { level: 14, title: 'Master',      minXP: 16900,  color: '#BDC3C7' },
  { level: 15, title: 'Grandmaster', minXP: 19600,  color: '#FFD700' },
  { level: 16, title: 'Legend',      minXP: 22500,  color: '#FFA500' },
  { level: 17, title: 'Titan',       minXP: 25600,  color: '#FF6347' },
  { level: 18, title: 'Immortal',    minXP: 28900,  color: '#DC143C' },
  { level: 19, title: 'Mythic',      minXP: 32400,  color: '#8B0000' },
  { level: 20, title: 'FitQuest God',minXP: 36100,  color: '#FFD700' },
];

// ── Badge Definitions ────────────────────────────────────────
export const BADGES = [
  // Activity Milestones
  { id: 'first_step',    name: 'First Step',    category: 'milestone', description: 'Log your very first activity',       criteria: { type: 'totalActivities', value: 1 },   emoji: '👟', points: 10 },
  { id: 'road_warrior',  name: 'Road Warrior',  category: 'milestone', description: 'Log 10 running sessions',            criteria: { type: 'activityCount',    activity: 'running', value: 10 }, emoji: '🏃', points: 50 },
  { id: 'century',       name: 'Century Club',  category: 'milestone', description: 'Log 100 total activities',           criteria: { type: 'totalActivities', value: 100 },  emoji: '💯', points: 200 },
  { id: 'calorie_king',  name: 'Calorie King',  category: 'milestone', description: 'Burn 10,000 total calories',         criteria: { type: 'totalCalories',    value: 10000 }, emoji: '🔥', points: 150 },
  { id: 'marathon_prep', name: 'Marathon Prep', category: 'milestone', description: 'Run a cumulative 42km',              criteria: { type: 'totalDistance',    activity: 'running', value: 42000 }, emoji: '🎽', points: 300 },
  { id: 'gym_rat',       name: 'Gym Rat',       category: 'milestone', description: 'Complete 25 gym workouts',           criteria: { type: 'activityCount',    activity: 'gym', value: 25 },     emoji: '🏋️', points: 100 },
  // Streak Achievements
  { id: 'streak_3',     name: '3-Day Streak',   category: 'streak',   description: 'Stay active for 3 consecutive days', criteria: { type: 'streak', value: 3 },   emoji: '🔥', points: 30 },
  { id: 'streak_7',     name: 'Week Warrior',   category: 'streak',   description: 'Stay active for 7 consecutive days', criteria: { type: 'streak', value: 7 },   emoji: '⚡', points: 70 },
  { id: 'streak_30',    name: 'Iron Habit',     category: 'streak',   description: 'Stay active for 30 consecutive days',criteria: { type: 'streak', value: 30 },  emoji: '💪', points: 300 },
  { id: 'streak_100',   name: 'Centurion',      category: 'streak',   description: '100-day activity streak',            criteria: { type: 'streak', value: 100 }, emoji: '👑', points: 1000 },
  // Social Engagement
  { id: 'social_1',     name: 'Team Player',    category: 'social',   description: 'Join your first group challenge',    criteria: { type: 'challengesJoined', value: 1 },  emoji: '🤝', points: 25 },
  { id: 'social_2',     name: 'Challenge Maker',category: 'social',   description: 'Create 5 group challenges',          criteria: { type: 'challengesCreated', value: 5 }, emoji: '🎯', points: 75 },
  { id: 'social_3',     name: 'Social Butterfly',category: 'social',  description: 'Add 10 friends',                     criteria: { type: 'friendCount', value: 10 },      emoji: '🦋', points: 50 },
  // Challenge Victories
  { id: 'champ_1',      name: 'First Win',      category: 'victory',  description: 'Win your first challenge',           criteria: { type: 'challengeWins', value: 1 },  emoji: '🥇', points: 100 },
  { id: 'champ_5',      name: 'Serial Winner',  category: 'victory',  description: 'Win 5 challenges',                   criteria: { type: 'challengeWins', value: 5 },  emoji: '🏆', points: 250 },
  // Special
  { id: 'early_bird',   name: 'Early Bird',     category: 'special',  description: 'Log an activity before 7am',         criteria: { type: 'earlyActivity' },            emoji: '🌅', points: 40 },
  { id: 'night_owl',    name: 'Night Owl',      category: 'special',  description: 'Log an activity after 10pm',         criteria: { type: 'lateActivity' },             emoji: '🦉', points: 40 },
];

// ── Core Calculation Functions ────────────────────────────────

/**
 * Calculate calories burned using the MET formula.
 * Calories = MET × Weight(kg) × Duration(hours)
 * @param {string} activityType - Key from ACTIVITY_TYPES
 * @param {number} durationMinutes - Duration of the activity
 * @param {number} weightKg - User's body weight in kilograms
 */
export const calculateCalories = (activityType, durationMinutes, weightKg = 70) => {
  const activity = ACTIVITY_TYPES[activityType];
  if (!activity) return 0;
  const durationHours = durationMinutes / 60;
  return Math.round(activity.met * weightKg * durationHours);
};

/**
 * Calculate XP points earned for an activity session.
 * Applies intensity bonus and duration scaling.
 * @param {string} activityType - Key from ACTIVITY_TYPES
 * @param {number} durationMinutes - Duration of the activity
 * @param {number} streak - User's current streak count (for multiplier)
 */
export const calculatePoints = (activityType, durationMinutes, streak = 0) => {
  const activity = ACTIVITY_TYPES[activityType];
  if (!activity) return 0;

  // Base: 1 point per minute of activity, weighted by base points tier
  const durationBonus = Math.floor(durationMinutes * (activity.basePoints / 30));
  let points = activity.basePoints + durationBonus;

  // Streak multiplier
  const multiplier = getStreakMultiplier(streak);
  points = Math.round(points * multiplier);

  return points;
};

/**
 * Get the streak multiplier for bonus points.
 * 7-day streak → 1.5×, 30-day streak → 2.0×
 */
export const getStreakMultiplier = (streak) => {
  if (streak >= 30) return 2.0;
  if (streak >= 14) return 1.75;
  if (streak >= 7)  return 1.5;
  if (streak >= 3)  return 1.25;
  return 1.0;
};

/**
 * Determine the level object based on total XP.
 * @param {number} totalXP - User's cumulative experience points
 */
export const getLevelFromXP = (totalXP) => {
  let currentLevel = LEVELS[0];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= LEVELS[i].minXP) {
      currentLevel = LEVELS[i];
      break;
    }
  }
  return currentLevel;
};

/**
 * Calculate progress percentage towards the next level.
 * @param {number} totalXP - User's cumulative XP
 */
export const getXPProgressToNextLevel = (totalXP) => {
  const current = getLevelFromXP(totalXP);
  const nextLevelIndex = LEVELS.findIndex(l => l.level === current.level + 1);
  if (nextLevelIndex === -1) return { percentage: 100, remaining: 0, nextLevel: null };

  const nextLevel = LEVELS[nextLevelIndex];
  const xpInCurrentLevel = totalXP - current.minXP;
  const xpRequiredForNext = nextLevel.minXP - current.minXP;
  const percentage = Math.min(100, Math.round((xpInCurrentLevel / xpRequiredForNext) * 100));
  const remaining = nextLevel.minXP - totalXP;

  return { percentage, remaining, nextLevel, current };
};

/**
 * Evaluate which badges a user has earned based on their stats.
 * @param {object} userStats - Object with totalActivities, activityCounts, totalCalories, streak, etc.
 * @param {string[]} alreadyEarned - Array of badge IDs already earned
 * @returns {string[]} Array of newly earned badge IDs
 */
export const evaluateNewBadges = (userStats, alreadyEarned = []) => {
  const newBadges = [];

  for (const badge of BADGES) {
    if (alreadyEarned.includes(badge.id)) continue;

    const { criteria } = badge;
    let earned = false;

    switch (criteria.type) {
      case 'totalActivities':
        earned = (userStats.totalActivities || 0) >= criteria.value;
        break;
      case 'activityCount':
        earned = (userStats.activityCounts?.[criteria.activity] || 0) >= criteria.value;
        break;
      case 'totalCalories':
        earned = (userStats.totalCalories || 0) >= criteria.value;
        break;
      case 'totalDistance':
        earned = (userStats.distanceCounts?.[criteria.activity] || 0) >= criteria.value;
        break;
      case 'streak':
        earned = (userStats.streak || 0) >= criteria.value;
        break;
      case 'challengesJoined':
        earned = (userStats.challengesJoined || 0) >= criteria.value;
        break;
      case 'challengesCreated':
        earned = (userStats.challengesCreated || 0) >= criteria.value;
        break;
      case 'friendCount':
        earned = (userStats.friendCount || 0) >= criteria.value;
        break;
      case 'challengeWins':
        earned = (userStats.challengeWins || 0) >= criteria.value;
        break;
      case 'earlyActivity':
        earned = userStats.hasEarlyActivity || false;
        break;
      case 'lateActivity':
        earned = userStats.hasLateActivity || false;
        break;
      default:
        break;
    }

    if (earned) newBadges.push(badge.id);
  }

  return newBadges;
};

/**
 * Calculate updated streak based on last activity date.
 * @param {Date|null} lastActivityDate
 * @param {number} currentStreak
 */
export const calculateStreak = (lastActivityDate, currentStreak) => {
  if (!lastActivityDate) return 1; // First activity ever

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const last = new Date(lastActivityDate.toDate ? lastActivityDate.toDate() : lastActivityDate);
  last.setHours(0, 0, 0, 0);

  const diffDays = Math.round((today - last) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return currentStreak;       // Already logged today
  if (diffDays === 1) return currentStreak + 1;   // Consecutive day
  return 1;                                        // Streak broken — reset
};

export default {
  ACTIVITY_TYPES,
  LEVELS,
  BADGES,
  calculateCalories,
  calculatePoints,
  getStreakMultiplier,
  getLevelFromXP,
  getXPProgressToNextLevel,
  evaluateNewBadges,
  calculateStreak,
};
