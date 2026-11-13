export type TimerMode = 'pomodoro' | 'short' | 'long';

export interface ModeTimerState {
  mode: TimerMode;
  totalTime: number;
  timeLeft: number;
  isRunning: boolean;
  elapsedRunSeconds: number;
}

export type MultiModeTimerState = Record<TimerMode, ModeTimerState>;

export interface ActivityDay {
  date: string;
  focusSeconds: number;
  focusMinutes: number;
  sessionsCompleted: number;
  tasksCompleted: number;
  backgroundsUsed: string[];
  widgetsUsed: string[];
}

export interface StudyStats {
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
  achievements: string[];
  lastCalculated: string;
}

export interface SessionRecord {
  id: string;
  userId: string;
  startTime: string;
  endTime: string;
  duration: number;
  mode: TimerMode;
  completed: boolean;
}

export const DEFAULT_DURATIONS: Record<TimerMode, number> = {
  pomodoro: 1500,
  short: 300,
  long: 900,
};

export function createInitialTimerState(): MultiModeTimerState {
  return {
    pomodoro: { mode: 'pomodoro', totalTime: 1500, timeLeft: 1500, isRunning: false, elapsedRunSeconds: 0 },
    short:    { mode: 'short',    totalTime: 300,  timeLeft: 300,  isRunning: false, elapsedRunSeconds: 0 },
    long:     { mode: 'long',     totalTime: 900,  timeLeft: 900,  isRunning: false, elapsedRunSeconds: 0 },
  };
}

export function startModeTimer(state: MultiModeTimerState, mode: TimerMode): MultiModeTimerState {
  const current = state[mode];
  if (current.isRunning) return state;
  return {
    ...state,
    [mode]: {
      ...current,
      timeLeft: current.timeLeft <= 0 ? current.totalTime : current.timeLeft,
      isRunning: true,
    },
  };
}

export function pauseModeTimer(state: MultiModeTimerState, mode: TimerMode): MultiModeTimerState {
  const current = state[mode];
  if (!current.isRunning) return state;
  return {
    ...state,
    [mode]: {
      ...current,
      isRunning: false,
    },
  };
}

export function resetModeTimer(state: MultiModeTimerState, mode: TimerMode): MultiModeTimerState {
  const current = state[mode];
  return {
    ...state,
    [mode]: {
      ...current,
      timeLeft: current.totalTime,
      isRunning: false,
      elapsedRunSeconds: 0,
    },
  };
}

export interface TickResult {
  nextState: MultiModeTimerState;
  focusSecondsEarned: number;
  completedModes: Array<{ mode: TimerMode; duration: number }>;
}

/**
 * Advances all currently running timers by 1 second independently.
 * Switching visible tabs never stops or resets timers running in other modes.
 * Only running `pomodoro` time earns focus seconds.
 */
export function tickRunningTimers(state: MultiModeTimerState): TickResult {
  let focusSecondsEarned = 0;
  const completedModes: Array<{ mode: TimerMode; duration: number }> = [];
  const nextState: MultiModeTimerState = { ...state };

  (['pomodoro', 'short', 'long'] as TimerMode[]).forEach((mode) => {
    const m = state[mode];
    if (!m.isRunning) return;

    const nextLeft = Math.max(0, m.timeLeft - 1);
    const nextElapsed = m.elapsedRunSeconds + 1;
    if (mode === 'pomodoro') {
      focusSecondsEarned += 1;
    }

    if (nextLeft <= 0) {
      completedModes.push({ mode, duration: m.totalTime });
      nextState[mode] = {
        ...m,
        timeLeft: m.totalTime,
        isRunning: false,
        elapsedRunSeconds: 0,
      };
    } else {
      nextState[mode] = {
        ...m,
        timeLeft: nextLeft,
        elapsedRunSeconds: nextElapsed,
      };
    }
  });

  return { nextState, focusSecondsEarned, completedModes };
}

export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDaySeconds(day: Partial<ActivityDay> | undefined): number {
  if (!day) return 0;
  if (typeof day.focusSeconds === 'number' && Number.isFinite(day.focusSeconds)) {
    return Math.max(0, Math.floor(day.focusSeconds));
  }
  if (typeof day.focusMinutes === 'number' && Number.isFinite(day.focusMinutes)) {
    return Math.max(0, Math.round(day.focusMinutes * 60));
  }
  return 0;
}

export function normalizeAndCalculateStats(
  sessions: SessionRecord[],
  activityMap: Record<string, Partial<ActivityDay>>,
  prevStats?: Partial<StudyStats> | null,
  now: Date = new Date()
): { stats: StudyStats; activity: Record<string, ActivityDay> } {
  const todayKey = localDateKey(now);
  const normalizedActivity: Record<string, ActivityDay> = {};

  for (const [k, raw] of Object.entries(activityMap || {})) {
    const secs = getDaySeconds(raw);
    normalizedActivity[k] = {
      date: raw.date || k,
      focusSeconds: secs,
      focusMinutes: Math.round((secs / 60) * 10) / 10,
      sessionsCompleted: Math.max(0, Number(raw.sessionsCompleted || 0)),
      tasksCompleted: Math.max(0, Number(raw.tasksCompleted || 0)),
      backgroundsUsed: Array.isArray(raw.backgroundsUsed) ? raw.backgroundsUsed : [],
      widgetsUsed: Array.isArray(raw.widgetsUsed) ? raw.widgetsUsed : [],
    };
  }

  // Last 7 days & 30 days keys (local calendar days)
  const last7Keys = new Set<string>();
  const last30Keys = new Set<string>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = localDateKey(d);
    last30Keys.add(key);
    if (i < 7) last7Keys.add(key);
  }

  const todaySecs = getDaySeconds(normalizedActivity[todayKey]);

  let weekSecs = 0;
  let monthSecs = 0;
  let allActivitySecs = 0;
  for (const [key, day] of Object.entries(normalizedActivity)) {
    const s = getDaySeconds(day);
    allActivitySecs += s;
    if (last7Keys.has(key)) weekSecs += s;
    if (last30Keys.has(key)) monthSecs += s;
  }

  const completedPomodoros = (sessions || []).filter(
    (s) => s && s.completed && s.mode === 'pomodoro'
  );
  const completedTotalSecs = completedPomodoros.reduce((acc, s) => acc + Math.max(0, Number(s.duration || 0)), 0);

  // Guarantee mathematical consistency: today <= week <= month <= total
  const safeWeekSecs = Math.max(todaySecs, weekSecs);
  const safeMonthSecs = Math.max(safeWeekSecs, monthSecs);
  const safeTotalSecs = Math.max(
    safeMonthSecs,
    allActivitySecs,
    completedTotalSecs,
    Math.max(0, Number(prevStats?.totalFocusSeconds || 0))
  );

  const longest = completedPomodoros.length
    ? Math.max(...completedPomodoros.map((s) => Number(s.duration || 0)))
    : Math.max(0, Number(prevStats?.longestSession || 0));

  const avg = completedPomodoros.length
    ? Math.round(completedTotalSecs / completedPomodoros.length)
    : Math.max(0, Number(prevStats?.avgSessionDuration || 0));

  // Streak calculation across days with any completed session or >= 60s focus
  const activeDay = (k: string) =>
    (normalizedActivity[k]?.sessionsCompleted ?? 0) > 0 || getDaySeconds(normalizedActivity[k]) >= 60;

  let currentStreak = 0;
  if (activeDay(todayKey)) {
    currentStreak = 1;
    for (let i = 1; i < 365; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      if (activeDay(localDateKey(d))) currentStreak++;
      else break;
    }
  }

  const sortedDays = Object.keys(normalizedActivity).sort();
  let longestStreak = currentStreak;
  let runningStreak = 0;
  let prevDate: Date | null = null;
  for (const dayKey of sortedDays) {
    if (!activeDay(dayKey)) {
      runningStreak = 0;
      prevDate = null;
      continue;
    }
    const currDate = new Date(dayKey + 'T12:00:00');
    if (prevDate && Math.round((currDate.getTime() - prevDate.getTime()) / 86400000) === 1) {
      runningStreak++;
    } else {
      runningStreak = 1;
    }
    if (runningStreak > longestStreak) longestStreak = runningStreak;
    prevDate = currDate;
  }

  const totalSessions = Math.max(
    completedPomodoros.length,
    Object.values(normalizedActivity).reduce((a, d) => a + d.sessionsCompleted, 0)
  );

  const achievementChecks: Array<{ id: string; ok: boolean }> = [
    { id: 'first_session',  ok: totalSessions >= 1 },
    { id: 'ten_sessions',   ok: totalSessions >= 10 },
    { id: 'fifty_sessions', ok: totalSessions >= 50 },
    { id: 'one_hour',       ok: safeTotalSecs >= 3600 },
    { id: 'ten_hours',      ok: safeTotalSecs >= 36000 },
    { id: 'hundred_hours',  ok: safeTotalSecs >= 360000 },
    { id: 'streak_3',       ok: longestStreak >= 3 },
    { id: 'streak_7',       ok: longestStreak >= 7 },
    { id: 'streak_30',      ok: longestStreak >= 30 },
    { id: 'long_session',   ok: longest >= 3600 },
  ];

  const stats: StudyStats = {
    totalFocusSeconds: safeTotalSecs,
    todayFocusSeconds: todaySecs,
    weekFocusSeconds: safeWeekSecs,
    monthFocusSeconds: safeMonthSecs,
    currentStreak,
    longestStreak,
    totalSessionsCompleted: totalSessions,
    avgSessionDuration: avg,
    longestSession: longest,
    totalTasksCompleted: Math.max(0, Number(prevStats?.totalTasksCompleted || 0)),
    achievements: achievementChecks.filter((a) => a.ok).map((a) => a.id),
    lastCalculated: now.toISOString(),
  };

  return { stats, activity: normalizedActivity };
}

export function formatFocusDuration(secs: number): string {
  const safe = Math.max(0, Math.floor(secs));
  if (safe < 60) return `${safe}s`;
  if (safe < 3600) {
    const m = Math.floor(safe / 60);
    const rem = safe % 60;
    return rem > 0 && m < 10 ? `${m}m ${rem}s` : `${m}m`;
  }
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function getHeatmapLevel(focusSeconds: number): number {
  if (focusSeconds <= 0) return 0;
  const mins = focusSeconds / 60;
  if (mins < 5) return 1;
  if (mins < 15) return 2;
  if (mins < 30) return 3;
  if (mins < 60) return 4;
  return 5;
}
