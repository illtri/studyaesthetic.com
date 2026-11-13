import { supabase, isSupabaseConfigured } from './supabase';
import type { UserPreferences, StudyStats, SessionRecord } from '../utils/UserStore';
import type { VideoEntry } from '../utils/VideoDatabase';

export async function pushPreferencesToCloud(userId: string, prefs: UserPreferences): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('user_preferences').upsert({
      user_id: userId,
      theme: prefs.theme || 'dark',
      selected_background: prefs.selectedBackground,
      selected_background_type: prefs.selectedBackgroundType,
      timer_settings: prefs.timerSettings,
      sound_volumes: prefs.soundVolumes,
      notifications: prefs.notifications ?? false,
      focus_mode: prefs.focusMode ?? false,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.warn('Supabase: push preferences error', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase: pushPreferencesToCloud exception', err);
    return false;
  }
}

export async function pullPreferencesFromCloud(userId: string): Promise<Partial<UserPreferences> | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      userId: data.user_id,
      theme: data.theme,
      selectedBackground: data.selected_background,
      selectedBackgroundType: data.selected_background_type,
      timerSettings: data.timer_settings,
      soundVolumes: data.sound_volumes,
      notifications: data.notifications,
      focusMode: data.focus_mode,
    };
  } catch (err) {
    console.error('Supabase: pullPreferencesFromCloud exception', err);
    return null;
  }
}

export async function pushSessionToCloud(session: SessionRecord): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('study_sessions').insert({
      id: session.id,
      user_id: session.userId,
      start_time: session.startTime,
      end_time: session.endTime,
      duration: session.duration,
      mode: session.mode,
      completed: session.completed,
      background_used: session.backgroundUsed || null,
      sounds_used: session.soundsUsed || [],
    });
    if (error) {
      console.warn('Supabase: push session error', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase: pushSessionToCloud exception', err);
    return false;
  }
}

export async function pushStatsToCloud(userId: string, stats: StudyStats): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('study_stats').upsert({
      user_id: userId,
      total_focus_seconds: stats.totalFocusSeconds,
      today_focus_seconds: stats.todayFocusSeconds,
      week_focus_seconds: stats.weekFocusSeconds,
      month_focus_seconds: stats.monthFocusSeconds,
      current_streak: stats.currentStreak,
      longest_streak: stats.longestStreak,
      total_sessions_completed: stats.totalSessionsCompleted,
      avg_session_duration: stats.avgSessionDuration,
      longest_session: stats.longestSession,
      total_tasks_completed: stats.totalTasksCompleted,
      most_used_background: stats.mostUsedBackground || null,
      most_productive_hour: stats.mostProductiveHour,
      achievements: stats.achievements || [],
      last_calculated: new Date().toISOString(),
    });
    if (error) {
      console.warn('Supabase: push stats error', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase: pushStatsToCloud exception', err);
    return false;
  }
}

export async function pullStatsFromCloud(userId: string): Promise<Partial<StudyStats> | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('study_stats')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      userId: data.user_id,
      totalFocusSeconds: Number(data.total_focus_seconds || 0),
      todayFocusSeconds: Number(data.today_focus_seconds || 0),
      weekFocusSeconds: Number(data.week_focus_seconds || 0),
      monthFocusSeconds: Number(data.month_focus_seconds || 0),
      currentStreak: Number(data.current_streak || 0),
      longestStreak: Number(data.longest_streak || 0),
      totalSessionsCompleted: Number(data.total_sessions_completed || 0),
      avgSessionDuration: Number(data.avg_session_duration || 0),
      longestSession: Number(data.longest_session || 0),
      totalTasksCompleted: Number(data.total_tasks_completed || 0),
      mostUsedBackground: data.most_used_background,
      mostProductiveHour: data.most_productive_hour,
      achievements: data.achievements || [],
      lastCalculated: data.last_calculated,
    };
  } catch (err) {
    console.error('Supabase: pullStatsFromCloud exception', err);
    return null;
  }
}
