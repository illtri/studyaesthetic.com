import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSignedInProfile,
  canAccessSound,
  canAccessSpace,
  canAccessWidget,
  createAvatarDataUri,
  deriveDisplayName,
  getDefaultChooserAccounts,
  isAuthenticatedProfile,
} from './authHelper';

test('buildSignedInProfile sets non-anonymous authProvider for Google, Apple Mail, Email, and Demo', () => {
  const googleUser = buildSignedInProfile({ provider: 'google' });
  assert.equal(googleUser.authProvider, 'google');
  assert.equal(isAuthenticatedProfile(googleUser), true);

  const appleUser = buildSignedInProfile({ provider: 'apple', email: 'alex.chen@icloud.com' });
  assert.equal(appleUser.authProvider, 'apple');
  assert.equal(appleUser.name, 'Alex Chen');
  assert.equal(appleUser.email, 'alex.chen@icloud.com');
  assert.equal(isAuthenticatedProfile(appleUser), true);

  const demoUser = buildSignedInProfile({ provider: 'demo' });
  assert.equal(demoUser.authProvider, 'demo');
  assert.equal(isAuthenticatedProfile(demoUser), true);

  const emailUser = buildSignedInProfile({
    provider: 'email',
    email: 'student@university.edu',
    name: 'Maya Lin',
  });
  assert.equal(emailUser.authProvider, 'email');
  assert.equal(emailUser.name, 'Maya Lin');
  assert.equal(isAuthenticatedProfile(emailUser), true);
});

test('isAuthenticatedProfile rejects anonymous or default profiles', () => {
  assert.equal(
    isAuthenticatedProfile({
      id: '1',
      name: 'Study Aesthetic User',
      email: '',
      authProvider: 'anonymous',
    }),
    false
  );
  assert.equal(isAuthenticatedProfile(null), false);
});

test('guest access gating allows only starter widgets, spaces, and sounds when signed out', () => {
  // Widgets
  assert.equal(canAccessWidget('timer-widget', false), true);
  assert.equal(canAccessWidget('soundboard-widget', false), true);
  assert.equal(canAccessWidget('spotify-widget', false), false);
  assert.equal(canAccessWidget('tasks-widget', false), false);
  assert.equal(canAccessWidget('notes-widget', false), false);
  assert.equal(canAccessWidget('stats-widget', false), false);
  assert.equal(canAccessWidget('spotify-widget', true), true);

  // Spaces
  assert.equal(canAccessSpace('lofi-cafe', 'direct_video', false), true);
  assert.equal(canAccessSpace('cyberpunk-city', 'direct_video', false), false);
  assert.equal(canAccessSpace('yt-chillhop-radio', 'youtube', false), false);
  assert.equal(canAccessSpace('yt-chillhop-radio', 'youtube', true), true);

  // Sounds (only lofi and rain unlocked for guests; most music & ambient sounds locked)
  assert.equal(canAccessSound('lofi', false), true);
  assert.equal(canAccessSound('rain', false), true);
  assert.equal(canAccessSound('piano', false), false);
  assert.equal(canAccessSound('synthwave', false), false);
  assert.equal(canAccessSound('thunder', false), false);
  assert.equal(canAccessSound('piano', true), true);
  assert.equal(canAccessSound('thunder', true), true);
});

test('getDefaultChooserAccounts returns Google and Apple Mail accounts', () => {
  const googleAccounts = getDefaultChooserAccounts('google');
  assert.equal(googleAccounts.length, 2);
  assert.equal(googleAccounts[0].email, 'atulkumar.archu@gmail.com');
  assert.equal(googleAccounts[1].email, 'arunav.singh18.7@gmail.com');

  const appleAccounts = getDefaultChooserAccounts('apple');
  assert.equal(appleAccounts.length, 2);
  assert.equal(appleAccounts[0].email, 'atulkumar.archu@icloud.com');
});

test('deriveDisplayName and createAvatarDataUri produce clean values', () => {
  assert.equal(deriveDisplayName('john.doe@gmail.com'), 'John Doe');
  assert.ok(createAvatarDataUri('John Doe', 'google').startsWith('data:image/svg+xml;utf8,'));
});
