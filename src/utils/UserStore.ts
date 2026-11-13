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
 * This module is the SINGLE source of truth for sessions, activity
 * and derived statistics. The widgets used to keep private copies of
 * this logic which drifted apart (month totals showing the week
 * value, longest streak showing the current streak, day keys built
 * from UTC dates). Everything now goes through here.
 *
 * SUPABASE MIGRATION PATH (future):
 *   import { createClient } from '@supabase/supabase-js'
 *   const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
 *   // Replace get/set with: supabase.from('users').select() etc.
 */

// ─── Type Definitions ──────────────────────────────────────────────

export type AuthProvider = 'anonymous' | 'google' | 'github' | 'email' | 'demo';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  authProvider: AuthProvider;
  avatarUrl?: string;
  createdAt: string;
  lastActiveAt: string;
}

export interface TimerSettings {
  pomodoro: number;                     // seconds
  shortBreak: number;
  longBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export interface UserPreferences {
  userId: string;
  theme: 'dark';                          // only dark mode supported
  selectedBackground: string;            // background/space ID
  selectedBackgroundType: 'video' | 'image' | 'youtube';
  timerSettings: TimerSettings;
  soundVolumes: Record<string, number>;  // soundId → 0-100
  notifications: boolean;
  focusMode: boolean;
}

export interface SessionRecord {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  duration: number;                      // seconds actually focused
  mode: 'pomodoro' | 'short' | 'long';
  completed: boolean;
  backgroundUsed?: string;
  soundsUsed?: string[];
}

export interface UserActivity {
  userId: string;
  date: string;                          // YYYY-MM-DD (LOCAL time)
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
  achievements: string[];               // achievement IDs
  lastCalculated: string;
  /** Identifies the session list the snapshot was calculated from. */
  fingerprint?: string;
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

/**
 * Local-time YYYY-MM-DD key.
 *
 * `toISOString()` returns a UTC timestamp, so using it for a "day"
 * bucket shifts every session into the previous/next day for anyone
 * not on UTC. All day bucketing must use the user's local calendar.
 */
export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function todayStr(): string {
  return localDateKey();
}

/** Local midnight (start of day) for a given local date key. */
function startOfLocalDay(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0).getTime();
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
  if (existing && existing.id) {
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

/** True when the profile represents a real (signed-in) account. */
export function isSignedIn(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return profile.authProvider !== 'anonymous';
}

// ─── Preferences ───────────────────────────────────────────────────

export function getPreferences(): UserPreferences {
  const user = getOrCreateUser();
  const existing = getStored<UserPreferences>(KEYS.PREFERENCES);

  if (existing) {
    // Merge forward so preferences saved by an older build keep working
    // and newly added fields always exist.
    const ts = existing.timerSettings || {};
    const merged: UserPreferences = {
      ...existing,
      timerSettings: {
        pomodoro:           ts.pomodoro           ?? 1500,
        shortBreak:         ts.shortBreak         ?? 300,
        longBreak:          ts.longBreak          ?? 900,
        autoStartBreaks:    ts.autoStartBreaks    ?? false,
        autoStartPomodoros: ts.autoStartPomodoros ?? false,
      },
      soundVolumes: existing.soundVolumes || {},
    };
    return merged;
  }

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

// ─── Sound volumes ─────────────────────────────────────────────────

export function getSoundVolumes(): Record<string, number> {
  return { ...(getPreferences().soundVolumes || {}) };
}

export function saveSoundVolumes(volumes: Record<string, number>): void {
  updatePreferences({ soundVolumes: { ...volumes } });
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
  updateDailyActivity(
    session.duration,
    session.completed,
    session.mode,
    session.startTime
  );
  return record;
}

export function getRecentSessions(limit = 30): SessionRecord[] {
  const sessions = getStored<SessionRecord[]>(KEYS.SESSIONS) || [];
  return sessions.slice(-limit).reverse();
}

// ─── Daily Activity ────────────────────────────────────────────────

function updateDailyActivity(
  focusSeconds: number,
  completed: boolean,
  mode: SessionRecord['mode'] = 'pomodoro',
  startTime?: string
) {
  const user     = getOrCreateUser();
  const dayKey   = startTime ? localDateKey(new Date(startTime)) : todayStr();
  const activity = getStored<Record<string, UserActivity>>(KEYS.ACTIVITY) || {};

  if (!activity[dayKey]) {
    activity[dayKey] = {
      userId:            user.id,
      date:              dayKey,
      focusMinutes:      0,
      sessionsCompleted: 0,
      tasksCompleted:    0,
      backgroundsUsed:   [],
      widgetsUsed:       [],
    };
  }

  // Only pomodoro sessions count as focus time — breaks are breaks.
  if (completed && mode === 'pomodoro') {
    activity[dayKey].focusMinutes += Math.round(focusSeconds / 60);
    activity[dayKey].sessionsCompleted++;
  }

  // Keep 90 days of activity
  const keys = Object.keys(activity).sort();
  while (keys.length > 90) {
    delete activity[keys.shift() as string];
  }

  setStored(KEYS.ACTIVITY, activity);
  recalculateStats();
}

/** Record a completed task (used by the task list widget). */
export function recordTaskCompleted(count = 1): void {
  const user     = getOrCreateUser();
  const dayKey   = todayStr();
  const activity = getStored<Record<string, UserActivity>>(KEYS.ACTIVITY) || {};

  if (!activity[dayKey]) {
    activity[dayKey] = {
      userId:            user.id,
      date:              dayKey,
      focusMinutes:      0,
      sessionsCompleted: 0,
      tasksCompleted:    0,
      backgroundsUsed:   [],
      widgetsUsed:       [],
    };
  }

  activity[dayKey].tasksCompleted += count;
  setStored(KEYS.ACTIVITY, activity);
  recalculateStats();
}

export function getDailyActivity(days = 7): UserActivity[] {
  const user     = getOrCreateUser();
  const activity = getStored<Record<string, UserActivity>>(KEYS.ACTIVITY) || {};
  const result: UserActivity[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = localDateKey(d);
    result.push(activity[key] || {
      userId:            user.id,
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
  // Time windows (local calendar based)
  const todayStart  = startOfLocalDay(today);
  const weekStart   = startOfLocalDay(localDateKey(new Date(Date.now() - 6 * 86400000)));
  const monthStart  = startOfLocalDay(localDateKey(new Date(Date.now() - 29 * 86400000)));

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

  const totalTasks = Object.values(activity)
    .reduce((sum, a) => sum + (a.tasksCompleted || 0), 0);

  // ── Streak calculation ───────────────────────────────────────────
  // A streak counts CONSECUTIVE days with at least one completed
  // session. The previous implementation counted *any* active day,
  // which inflated both the current and the longest streak.
  const activeDays = Object.keys(activity)
    .filter(day => (activity[day].sessionsCompleted || 0) > 0)
    .sort();

  const activeDaySet = new Set(activeDays);

  let currentStreak = 0;
  if (activeDaySet.has(today)) {
    currentStreak = 1;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    for (let i = 0; i < 400; i++) {
      cursor.setDate(cursor.getDate() - 1);
      if (activeDaySet.has(localDateKey(cursor))) currentStreak++;
      else break;
    }
  }

  let longestStreak = 0;
  let run = 0;
  let prevTime: number | null = null;
  for (const day of activeDays) {
    const t = startOfLocalDay(day);
    // activeDays is sorted ascending, so the gap is (t - prevTime).
    if (prevTime !== null && Math.round((t - prevTime) / 86400000) === 1) {
      run++;
    } else {
      run = 1;
    }
    prevTime = t;
    if (run > longestStreak) longestStreak = run;
  }

  // Most productive hour
  const hourBuckets = new Array(24).fill(0);
  for (const s of completed) {
    hourBuckets[new Date(s.startTime).getHours()] += s.duration;
  }
  const mostProductiveHour = hourBuckets.reduce(
    (best, val, idx) => (val > hourBuckets[best] ? idx : best),
    0
  );

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
    totalTasksCompleted:     totalTasks,
    mostUsedBackground:      'lofi-cafe',
    mostProductiveHour,
    achievements:            [],
    lastCalculated:          nowISO(),
    fingerprint:             sessionFingerprint(sessions),
  };

  stats.achievements = allAchievements
    .filter(a => a.condition(stats))
    .map(a => a.id);

  setStored(KEYS.STATS, stats);
  return stats;
}

/**
 * Fingerprint of the session list. Two snapshots with the same
 * fingerprint were calculated from the same data, so the cached stats
 * can be reused. Using a timestamp was not enough: a session saved in
 * the same millisecond as the last calculation looked "not newer" and
 * the stats were silently stale.
 */
function sessionFingerprint(sessions: SessionRecord[]): string {
  if (sessions.length === 0) return '0';
  const last = sessions[sessions.length - 1];
  return `${sessions.length}:${last.id}:${last.duration}:${last.completed ? 1 : 0}`;
}

/**
 * Read the stored statistics, recomputing them when they are missing
 * or stale. The stats widget used to render "0m" for everyone who had
 * not finished a session since the last page load.
 */
export function getStats(): StudyStats {
  const stored   = getStored<StudyStats>(KEYS.STATS);
  const sessions = getStored<SessionRecord[]>(KEYS.SESSIONS) || [];

  if (!stored) return recalculateStats();

  if (stored.fingerprint !== sessionFingerprint(sessions)) {
    return recalculateStats();
  }

  return stored;
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
