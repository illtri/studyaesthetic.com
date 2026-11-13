/**
 * Regression tests for the user data layer (src/utils/UserStore.ts).
 *
 * Run with:  npm test
 *
 * These cover the bugs that were fixed in the stats rewrite:
 *   - day buckets built from UTC dates instead of the local calendar
 *   - break sessions counted as focus time
 *   - streaks counting non-consecutive days
 *   - month totals reporting the week total
 *   - a cached stats snapshot being reused after it went stale
 */

// ── localStorage shim ─────────────────────────────────────────────
const store = new Map<string, string>();
const shim = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => { store.set(k, v); },
  removeItem: (k: string) => { store.delete(k); },
  clear: () => { store.clear(); },
  key: (i: number) => Array.from(store.keys())[i] ?? null,
  get length() { return store.size; },
};
(globalThis as unknown as { localStorage: Storage }).localStorage = shim;

export {};

const U = await import('../src/utils/UserStore.ts');

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${ok ? '' : `  (got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)})`}`);
}

const dayKey = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return U.localDateKey(d);
};

const mkSession = (offset: number, duration = 1500) => ({
  startTime: new Date(new Date().setDate(new Date().getDate() - offset)).toISOString(),
  endTime: new Date().toISOString(),
  duration,
  mode: 'pomodoro' as const,
  completed: true,
});

// ── 1. Day buckets use the LOCAL calendar ─────────────────────────
check('localDateKey uses the local calendar', U.localDateKey(new Date(2026, 0, 5, 23, 30)), '2026-01-05');

// ── 2. A completed pomodoro session is recorded as focus time ─────
store.clear();
U.getOrCreateUser();
U.recordSession({
  startTime: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  endTime: new Date().toISOString(),
  duration: 1500,
  mode: 'pomodoro',
  completed: true,
});
let stats = U.getStats();
check('pomodoro counts toward focus seconds', stats.totalFocusSeconds, 1500);
check('pomodoro counts as a completed session', stats.totalSessionsCompleted, 1);
check('today focus seconds', stats.todayFocusSeconds, 1500);

// ── 3. Break sessions must NOT count as focus time ────────────────
U.recordSession({
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  duration: 300,
  mode: 'short',
  completed: true,
});
stats = U.getStats();
check('breaks do not count as focus time', stats.totalFocusSeconds, 1500);
check('breaks do not count as sessions', stats.totalSessionsCompleted, 1);

// ── 4. Streaks count CONSECUTIVE days ─────────────────────────────
store.clear();
U.getOrCreateUser();
U.recordSession(mkSession(0));
U.recordSession(mkSession(1));
U.recordSession(mkSession(2));
stats = U.getStats();
check('consecutive days produce a 3 day streak', stats.currentStreak, 3);
check('longest streak is the current run', stats.longestStreak, 3);

store.clear();
U.getOrCreateUser();
U.recordSession(mkSession(0));
U.recordSession(mkSession(3)); // gap on days 1 and 2
stats = U.getStats();
check('a gap resets the current streak', stats.currentStreak, 1);
check('longest streak keeps the best run', stats.longestStreak, 1);

// ── 5. The heatmap window uses local day keys ─────────────────────
const activity = U.getDailyActivity(7);
check('activity window has 7 days', activity.length, 7);
check('activity ends today (local)', activity[6].date, U.localDateKey());
check('activity starts 6 days ago (local)', activity[0].date, dayKey(6));

// ── 6. Month total is independent from the week total ─────────────
store.clear();
U.getOrCreateUser();
const tenDaysAgo = new Date();
tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
U.recordSession({
  startTime: tenDaysAgo.toISOString(),
  endTime: tenDaysAgo.toISOString(),
  duration: 600,
  mode: 'pomodoro',
  completed: true,
});
stats = U.getStats();
check('a session 10 days ago is in the month total', stats.monthFocusSeconds, 600);
check('...but not in the week total', stats.weekFocusSeconds, 0);
check('...and not in today', stats.todayFocusSeconds, 0);

// ── 7. Completed tasks are tracked ────────────────────────────────
store.clear();
U.getOrCreateUser();
U.recordTaskCompleted();
U.recordTaskCompleted(2);
stats = U.getStats();
check('completed tasks are counted', stats.totalTasksCompleted, 3);

// ── 8. Stats are recomputed when the cache is stale ───────────────
store.clear();
U.getOrCreateUser();
U.recordSession(mkSession(0));
check('stats were persisted', typeof JSON.parse(store.get('sa_stats_v1')!).totalFocusSeconds, 'number');

const sessions = JSON.parse(store.get('sa_sessions_v1')!);
sessions.push({
  id: 'manual-session',
  userId: 'u',
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  duration: 300,
  mode: 'pomodoro',
  completed: true,
});
store.set('sa_sessions_v1', JSON.stringify(sessions));
check('stale cache is recomputed', U.getStats().totalFocusSeconds, 1800);

console.log(`\n${failures === 0 ? 'ALL TESTS PASSED' : failures + ' TEST(S) FAILED'}`);
if (failures !== 0) {
  (globalThis as unknown as { process: { exitCode: number } }).process.exitCode = 1;
}
