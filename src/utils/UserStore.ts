/**
 * UserStore.ts
 * ─────────────────────────────────────────────────────────────────
 * Client-side user data layer for StudyAesthetic.
 *
 * Architecture: All data persists in localStorage under namespaced
 * keys. The schema mirrors a production Supabase/PostgreSQL design
 * so that migration is drop-in:
 *   - Replace localStorage.getItem/setItem with Supabase SDK calls
 *   - Add auth provider (e.g., supabase.auth.signIn)
 *   - Enable Row Level Security on the tables
 *
 * SUPABASE MIGRATION PATH (future):
 *   import { createClient } from '@supabase/supabase-js'
 *   const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
 *   // Replace get/set with: supabase.from('users').select() etc.
 */

// ─── Type Definitions ──────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  authProvider: 'anonymous' | 'google' | 'github' | 'email';
  avatarUrl?: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface UserPreferences {
  userId: string;
  theme: 'dark';                          // only dark mode supported
  selectedBackground: string;            // background/space ID
  selectedBackgroundType: 'video' | 'image' | 'youtube';
  timerSettings: {
    pomodoro: number;                     // seconds
    shortBreak: number;
    longBreak: number;
    autoStartBreaks: boolean;
    autoStartPomodoros: boolean;
  };
  soundVolumes: Record<string, number>;  // soundId → 0-100
  notifications: boolean;
  focusMode: boolean;
}

export interface IslandLayout {
  userId: string;
  widgets: Record<string, {
    x: number;
    y: number;
    visible: boolean;
    minimized: boolean;
    zIndex: number;
  }>;
  updatedAt: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  duration: number;                      // seconds
  mode: 'pomodoro' | 'short' | 'long';
  completed: boolean;
  backgroundUsed?: string;
  soundsUsed?: string[];
}

export interface UserActivity {
  userId: string;
  date: string;                          // YYYY-MM-DD
  focusMinutes: number;
  sessionsCompleted: number;
  tasksCompleted: number;
  backgroundsUsed: string[];
  widgetsUsed: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (stats: StudyStats) => boolean;
  unlockedAt?: string;
}

export interface StudyStats {
  userId: string;
  totalFocusSeconds: number;
  todayFocusSeconds: number;
  weekFocusSeconds: number;
  monthFocusSeconds: number;
  currentStreak: number;
  longestStreak: number;
  totalSessionsCompleted: number;
  avgSessionDuration: number;
  longestSession: number;
  totalTasksCompleted: number;
  mostUsedBackground: string;
  mostProductiveHour: number;           // 0-23
  achievements: string[];              // achievement IDs
  lastCalculated: string;
}

export interface FavoriteItem {
  userId: string;
  itemId: string;
  itemType: 'background' | 'space' | 'soundPreset';
  addedAt: string;
}

// ─── Storage Keys ──────────────────────────────────────────────────

const KEYS = {
  USER_PROFILE:     'sa_user_profile_v1',
  PREFERENCES:      'sa_user_prefs_v1',
  ISLAND_LAYOUT:    'sa_island_layout_v1',
  SESSIONS:         'sa_sessions_v1',
  ACTIVITY:         'sa_activity_v1',
  STATS:            'sa_stats_v1',
  FAVORITES:        'sa_favorites_v1',
  RECENTLY_USED:    'sa_recently_used_v1',
} as const;

// ─── Helpers ───────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function getStored<T>(key: string): T | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function setStored<T>(key: string, value: T): void {
  if (typeof localStorage === 'undefined') return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ─── User Profile ──────────────────────────────────────────────────

export function getOrCreateUser(): UserProfile {
  const existing = getStored<UserProfile>(KEYS.USER_PROFILE);
  if (existing) {
    // Update last active
    existing.lastActiveAt = nowISO();
    setStored(KEYS.USER_PROFILE, existing);
    return existing;
  }

  const profile: UserProfile = {
    id:           generateId(),
    name:         'Study Aesthetic User',
    email:        '',
    authProvider: 'anonymous',
    createdAt:    nowISO(),
    lastActiveAt: nowISO(),
  };
  setStored(KEYS.USER_PROFILE, profile);
  return profile;
}

export function updateUserProfile(updates: Partial<UserProfile>): UserProfile {
  const current = getOrCreateUser();
  const updated = { ...current, ...updates, lastActiveAt: nowISO() };
  setStored(KEYS.USER_PROFILE, updated);
  return updated;
}

// ─── Preferences ───────────────────────────────────────────────────

export function getPreferences(): UserPreferences {
  const user = getOrCreateUser();
  const existing = getStored<UserPreferences>(KEYS.PREFERENCES);
  if (existing) return existing;

  const defaults: UserPreferences = {
    userId:                  user.id,
    theme:                   'dark',
    selectedBackground:      'lofi-cafe',
    selectedBackgroundType:  'youtube',
    timerSettings: {
      pomodoro:              1500,
      shortBreak:            300,
      longBreak:             900,
      autoStartBreaks:       false,
      autoStartPomodoros:    false,
    },
    soundVolumes:            {},
    notifications:           false,
    focusMode:               false,
  };
  setStored(KEYS.PREFERENCES, defaults);
  return defaults;
}

export function updatePreferences(updates: Partial<UserPreferences>): UserPreferences {
  const current = getPreferences();
  const updated = { ...current, ...updates };
  setStored(KEYS.PREFERENCES, updated);
  return updated;
}

// ─── Sessions ──────────────────────────────────────────────────────

export function recordSession(session: Omit<SessionRecord, 'id' | 'userId'>): SessionRecord {
  const user = getOrCreateUser();
  const record: SessionRecord = {
    id:     generateId(),
    userId: user.id,
    ...session,
  };

  const sessions = getStored<SessionRecord[]>(KEYS.SESSIONS) || [];
  sessions.push(record);

  // Keep last 500 sessions
  if (sessions.length > 500) sessions.splice(0, sessions.length - 500);

  setStored(KEYS.SESSIONS, sessions);
  updateDailyActivity(session.duration, session.completed);
  return record;
}

export function getRecentSessions(limit = 30): SessionRecord[] {
  const sessions = getStored<SessionRecord[]>(KEYS.SESSIONS) || [];
  return sessions.slice(-limit).reverse();
}

// ─── Daily Activity ────────────────────────────────────────────────

function updateDailyActivity(focusSeconds: number, completed: boolean) {
  const user     = getOrCreateUser();
  const today    = todayStr();
  const activity = getStored<Record<string, UserActivity>>(KEYS.ACTIVITY) || {};

  if (!activity[today]) {
    activity[today] = {
      userId:            user.id,
      date:              today,
      focusMinutes:      0,
      sessionsCompleted: 0,
      tasksCompleted:    0,
      backgroundsUsed:   [],
      widgetsUsed:       [],
    };
  }

  activity[today].focusMinutes     += Math.round(focusSeconds / 60);
  if (completed) activity[today].sessionsCompleted++;

  // Keep 90 days of activity
  const keys = Object.keys(activity).sort();
  if (keys.length > 90) delete activity[keys[0]];

  setStored(KEYS.ACTIVITY, activity);
  recalculateStats();
}

export function getDailyActivity(days = 7): UserActivity[] {
  const activity = getStored<Record<string, UserActivity>>(KEYS.ACTIVITY) || {};
  const result: UserActivity[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d   = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    result.push(activity[key] || {
      userId:            '',
      date:              key,
      focusMinutes:      0,
      sessionsCompleted: 0,
      tasksCompleted:    0,
      backgroundsUsed:   [],
      widgetsUsed:       [],
    });
  }
  return result;
}

// ─── Stats Calculation ─────────────────────────────────────────────

export function recalculateStats(): StudyStats {
  const user     = getOrCreateUser();
  const sessions = getStored<SessionRecord[]>(KEYS.SESSIONS) || [];
  const activity = getStored<Record<string, UserActivity>>(KEYS.ACTIVITY) || {};
  const today    = todayStr();

  // Time windows
  const todayStart  = new Date(today + 'T00:00:00').getTime();
  const weekStart   = new Date(todayStart - 6 * 86400000).getTime();
  const monthStart  = new Date(todayStart - 29 * 86400000).getTime();

  const completed = sessions.filter(s => s.completed && s.mode === 'pomodoro');
  const totalSecs = completed.reduce((s, r) => s + r.duration, 0);

  const todaySecs = completed
    .filter(s => new Date(s.startTime).getTime() >= todayStart)
    .reduce((s, r) => s + r.duration, 0);

  const weekSecs = completed
    .filter(s => new Date(s.startTime).getTime() >= weekStart)
    .reduce((s, r) => s + r.duration, 0);

  const monthSecs = completed
    .filter(s => new Date(s.startTime).getTime() >= monthStart)
    .reduce((s, r) => s + r.duration, 0);

  const longest = completed.length
    ? Math.max(...completed.map(s => s.duration))
    : 0;

  const avgDur = completed.length
    ? Math.round(totalSecs / completed.length)
    : 0;

  // Streak calculation
  let currentStreak = 0, longestStreak = 0, streak = 0;
  const sortedDays = Object.keys(activity).sort().reverse();
  const todayHasSessions = (activity[today]?.sessionsCompleted ?? 0) > 0;
  if (todayHasSessions) {
    currentStreak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      const prev = new Date(sortedDays[i - 1]);
      const curr = new Date(sortedDays[i]);
      const diff = (prev.getTime() - curr.getTime()) / 86400000;
      if (diff === 1 && activity[sortedDays[i]].sessionsCompleted > 0) {
        currentStreak++;
      } else break;
    }
  }
  streak = 0;
  for (const day of sortedDays) {
    if (activity[day].sessionsCompleted > 0) {
      streak++;
      if (streak > longestStreak) longestStreak = streak;
    } else {
      streak = 0;
    }
  }

  // Unlocked achievements
  const allAchievements = getAchievementDefinitions();
  const stats: StudyStats = {
    userId:                  user.id,
    totalFocusSeconds:       totalSecs,
    todayFocusSeconds:       todaySecs,
    weekFocusSeconds:        weekSecs,
    monthFocusSeconds:       monthSecs,
    currentStreak,
    longestStreak,
    totalSessionsCompleted:  completed.length,
    avgSessionDuration:      avgDur,
    longestSession:          longest,
    totalTasksCompleted:     0,
    mostUsedBackground:      'lofi-cafe',
    mostProductiveHour:      9,
    achievements:            [],
    lastCalculated:          nowISO(),
  };

  stats.achievements = allAchievements
    .filter(a => a.condition(stats))
    .map(a => a.id);

  setStored(KEYS.STATS, stats);
  return stats;
}

export function getStats(): StudyStats {
  return getStored<StudyStats>(KEYS.STATS) || recalculateStats();
}

// ─── Achievements ──────────────────────────────────────────────────

export function getAchievementDefinitions(): Achievement[] {
  return [
    {
      id:          'first_session',
      title:       'First Focus',
      description: 'Complete your first study session',
      icon:        '🎯',
      condition:   (s) => s.totalSessionsCompleted >= 1,
    },
    {
      id:          'ten_sessions',
      title:       'Getting Serious',
      description: 'Complete 10 study sessions',
      icon:        '🔟',
      condition:   (s) => s.totalSessionsCompleted >= 10,
    },
    {
      id:          'fifty_sessions',
      title:       'Study Master',
      description: 'Complete 50 sessions',
      icon:        '🏆',
      condition:   (s) => s.totalSessionsCompleted >= 50,
    },
    {
      id:          'one_hour',
      title:       'In the Zone',
      description: 'Accumulate 1 hour of focus time',
      icon:        '⏱️',
      condition:   (s) => s.totalFocusSeconds >= 3600,
    },
    {
      id:          'ten_hours',
      title:       'Deep Worker',
      description: 'Accumulate 10 hours of focus time',
      icon:        '🧠',
      condition:   (s) => s.totalFocusSeconds >= 36000,
    },
    {
      id:          'hundred_hours',
      title:       'Scholar',
      description: 'Accumulate 100 hours of focus time',
      icon:        '📚',
      condition:   (s) => s.totalFocusSeconds >= 360000,
    },
    {
      id:          'streak_3',
      title:       'On a Roll',
      description: '3 day study streak',
      icon:        '🔥',
      condition:   (s) => s.longestStreak >= 3,
    },
    {
      id:          'streak_7',
      title:       'Weekly Warrior',
      description: '7 day study streak',
      icon:        '⚡',
      condition:   (s) => s.longestStreak >= 7,
    },
    {
      id:          'streak_30',
      title:       'Unstoppable',
      description: '30 day study streak',
      icon:        '🌟',
      condition:   (s) => s.longestStreak >= 30,
    },
    {
      id:          'long_session',
      title:       'Marathon Session',
      description: 'Complete a session longer than 1 hour',
      icon:        '🏃',
      condition:   (s) => s.longestSession >= 3600,
    },
  ];
}

// ─── Favorites ─────────────────────────────────────────────────────

export function toggleFavorite(itemId: string, itemType: FavoriteItem['itemType']): boolean {
  const user = getOrCreateUser();
  const favorites = getStored<FavoriteItem[]>(KEYS.FAVORITES) || [];
  const idx = favorites.findIndex(f => f.itemId === itemId && f.userId === user.id);

  if (idx >= 0) {
    favorites.splice(idx, 1);
    setStored(KEYS.FAVORITES, favorites);
    return false;
  } else {
    favorites.push({ userId: user.id, itemId, itemType, addedAt: nowISO() });
    setStored(KEYS.FAVORITES, favorites);
    return true;
  }
}

export function isFavorite(itemId: string): boolean {
  const user      = getOrCreateUser();
  const favorites = getStored<FavoriteItem[]>(KEYS.FAVORITES) || [];
  return favorites.some(f => f.itemId === itemId && f.userId === user.id);
}

export function getFavorites(type?: FavoriteItem['itemType']): FavoriteItem[] {
  const user      = getOrCreateUser();
  const favorites = getStored<FavoriteItem[]>(KEYS.FAVORITES) || [];
  return favorites.filter(f => f.userId === user.id && (!type || f.itemType === type));
}

// ─── Recently Used ─────────────────────────────────────────────────

export function addRecentlyUsed(itemId: string, type: string) {
  const key     = KEYS.RECENTLY_USED;
  const recents = getStored<{ id: string; type: string; usedAt: string }[]>(key) || [];
  const filtered = recents.filter(r => r.id !== itemId);
  filtered.unshift({ id: itemId, type, usedAt: nowISO() });
  setStored(key, filtered.slice(0, 20));
}

export function getRecentlyUsed(type?: string, limit = 5) {
  const recents = getStored<{ id: string; type: string; usedAt: string }[]>(KEYS.RECENTLY_USED) || [];
  return recents.filter(r => !type || r.type === type).slice(0, limit);
}
