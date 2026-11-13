import type { UserProfile } from './UserStore';

export type SignedInProvider = 'email' | 'google' | 'apple' | 'demo';

export interface ChooserAccount {
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'google' | 'apple';
}

export const GUEST_ALLOWED_WIDGETS = new Set<string>([
  'timer-widget',
  'soundboard-widget',
]);

export const GUEST_LOCKED_WIDGET_NAMES: Record<string, string> = {
  'spotify-widget': 'Spotify Music Player',
  'tasks-widget': 'Task List',
  'notes-widget': 'Study Notes',
  'stats-widget': 'Study Statistics & Streaks',
  'breathing-widget': 'Breathing Guide',
};

export const GUEST_ALLOWED_SPACE_IDS = new Set<string>([
  'lofi-cafe',
  'tokyo-rain',
  'hogwarts-study',
]);

export const GUEST_ALLOWED_SOUND_IDS = new Set<string>([
  'lofi',
  'rain',
]);

export function canAccessWidget(widgetId: string, isSignedIn: boolean): boolean {
  if (isSignedIn) return true;
  return GUEST_ALLOWED_WIDGETS.has(widgetId);
}

export function canAccessSpace(
  spaceId: string,
  contentType: string,
  isSignedIn: boolean
): boolean {
  if (isSignedIn) return true;
  if (contentType === 'youtube' || contentType === 'image') return false;
  return GUEST_ALLOWED_SPACE_IDS.has(spaceId);
}

export function canAccessSound(soundId: string, isSignedIn: boolean): boolean {
  if (isSignedIn) return true;
  return GUEST_ALLOWED_SOUND_IDS.has(soundId);
}

export function deriveDisplayName(email: string, explicitName?: string): string {
  if (explicitName && explicitName.trim().length > 0) {
    return explicitName.trim();
  }
  const localPart = (email || '').split('@')[0] || 'Scholar';
  const cleaned = localPart
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return 'Scholar';
  return cleaned
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function createAvatarDataUri(name: string, provider: SignedInProvider = 'email'): string {
  const cleanName = (name || 'S').trim();
  const parts = cleanName.split(/\s+/);
  const initials =
    parts.length >= 2
      ? `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase()
      : cleanName.slice(0, 2).toUpperCase();

  const bgColors: Record<SignedInProvider, string> = {
    email: '#5e6ad2',
    google: '#3b82f6',
    apple: '#334155',
    demo: '#27a644',
  };
  const bg = bgColors[provider] || '#5e6ad2';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="${bg}"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="600">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getDefaultChooserAccounts(provider: 'google' | 'apple'): ChooserAccount[] {
  if (provider === 'google') {
    return [
      {
        name: 'Atul Kumar',
        email: 'atulkumar.archu@gmail.com',
        avatarUrl: createAvatarDataUri('Atul Kumar', 'google'),
        provider: 'google',
      },
      {
        name: 'Arunav Singh18',
        email: 'arunav.singh18.7@gmail.com',
        avatarUrl: createAvatarDataUri('Arunav Singh', 'google'),
        provider: 'google',
      },
    ];
  }
  return [
    {
      name: 'Atul Kumar',
      email: 'atulkumar.archu@icloud.com',
      avatarUrl: createAvatarDataUri('Atul Kumar', 'apple'),
      provider: 'apple',
    },
    {
      name: 'Arunav Singh18',
      email: 'arunav.singh18.7@icloud.com',
      avatarUrl: createAvatarDataUri('Arunav Singh', 'apple'),
      provider: 'apple',
    },
  ];
}

export function buildSignedInProfile(input: {
  email?: string;
  name?: string;
  provider: SignedInProvider;
  existingId?: string;
}): UserProfile {
  const provider = input.provider;
  const defaultEmails: Record<SignedInProvider, string> = {
    google: 'atulkumar.archu@gmail.com',
    apple: 'atulkumar.archu@icloud.com',
    demo: 'scholar@studyaesthetic.com',
    email: 'scholar@studyaesthetic.com',
  };
  const defaultNames: Record<SignedInProvider, string> = {
    google: 'Atul Kumar',
    apple: 'Atul Kumar',
    demo: 'Aesthetic Scholar',
    email: 'Study Scholar',
  };

  const rawEmail = (input.email || '').trim();
  const email = rawEmail.includes('@') ? rawEmail : defaultEmails[provider];
  const name =
    input.name && input.name.trim()
      ? input.name.trim()
      : rawEmail.includes('@')
      ? deriveDisplayName(email)
      : defaultNames[provider];

  const now = new Date().toISOString();
  const slug = email.toLowerCase().replace(/[^a-z0-9]/g, '-');

  return {
    id: input.existingId || `user-${provider}-${slug}`,
    name,
    email,
    authProvider: provider,
    avatarUrl: createAvatarDataUri(name, provider),
    createdAt: now,
    lastActiveAt: now,
  };
}

export function isAuthenticatedProfile(user: Partial<UserProfile> | null | undefined): boolean {
  if (!user || typeof user !== 'object') return false;
  if (!user.authProvider || user.authProvider === 'anonymous') return false;
  if (!user.name || user.name === 'Study Aesthetic User') return false;
  return true;
}
