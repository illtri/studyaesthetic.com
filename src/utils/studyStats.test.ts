import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialTimerState,
  startModeTimer,
  pauseModeTimer,
  resetModeTimer,
  tickRunningTimers,
  normalizeAndCalculateStats,
  formatFocusDuration,
  getHeatmapLevel,
  localDateKey,
} from './studyStats';

test('switching modes never stops or resets an already running timer', () => {
  let state = createInitialTimerState();
  state = startModeTimer(state, 'pomodoro');

  // Tick 3 seconds while viewing pomodoro
  for (let i = 0; i < 3; i++) {
    const res = tickRunningTimers(state);
    state = res.nextState;
    assert.equal(res.focusSecondsEarned, 1);
  }
  assert.equal(state.pomodoro.timeLeft, 1497);
  assert.equal(state.pomodoro.isRunning, true);

  // User clicks Short Break and starts Short Break too — Pomodoro keeps running independently!
  state = startModeTimer(state, 'short');
  const tickAfterBreakStart = tickRunningTimers(state);
  state = tickAfterBreakStart.nextState;
  assert.equal(state.pomodoro.timeLeft, 1496);
  assert.equal(state.pomodoro.isRunning, true);
  assert.equal(state.short.timeLeft, 299);
  assert.equal(state.short.isRunning, true);
  // Only pomodoro earns focus seconds
  assert.equal(tickAfterBreakStart.focusSecondsEarned, 1);

  // Pausing short break leaves pomodoro running
  state = pauseModeTimer(state, 'short');
  assert.equal(state.short.isRunning, false);
  assert.equal(state.short.timeLeft, 299);
  assert.equal(state.pomodoro.isRunning, true);

  // Resetting short break leaves pomodoro untouched
  state = resetModeTimer(state, 'short');
  assert.equal(state.short.timeLeft, 300);
  assert.equal(state.pomodoro.timeLeft, 1496);
  assert.equal(state.pomodoro.isRunning, true);
});

test('paused timer or break-only timer earns 0 focus seconds', () => {
  let state = createInitialTimerState();
  // All paused
  const r1 = tickRunningTimers(state);
  assert.equal(r1.focusSecondsEarned, 0);

  // Only Short Break running
  state = startModeTimer(state, 'short');
  const r2 = tickRunningTimers(state);
  assert.equal(r2.focusSecondsEarned, 0);
  assert.equal(r2.nextState.short.timeLeft, 299);
});

test('normalizeAndCalculateStats guarantees today <= week <= total consistency and accumulates', () => {
  const now = new Date('2026-11-13T14:00:00');
  const today = localDateKey(now);
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = localDateKey(yesterdayDate);

  const { stats, activity } = normalizeAndCalculateStats(
    [],
    {
      [yesterday]: { focusSeconds: 120, sessionsCompleted: 1 },
      [today]: { focusSeconds: 30, sessionsCompleted: 0 },
    },
    { totalFocusSeconds: 6 }, // stale smaller total from legacy bug
    now
  );

  assert.equal(stats.todayFocusSeconds, 30);
  assert.equal(stats.weekFocusSeconds, 150);
  assert.equal(stats.totalFocusSeconds, 150);
  assert.ok(stats.todayFocusSeconds <= stats.weekFocusSeconds);
  assert.ok(stats.weekFocusSeconds <= stats.totalFocusSeconds);
  assert.equal(activity[today].focusSeconds, 30);
});

test('formatFocusDuration and getHeatmapLevel handle seconds and minutes cleanly', () => {
  assert.equal(formatFocusDuration(0), '0s');
  assert.equal(formatFocusDuration(45), '45s');
  assert.equal(formatFocusDuration(125), '2m 5s');
  assert.equal(formatFocusDuration(3660), '1h 1m');
  assert.equal(getHeatmapLevel(0), 0);
  assert.equal(getHeatmapLevel(15), 1);
  assert.equal(getHeatmapLevel(600), 2);
});
