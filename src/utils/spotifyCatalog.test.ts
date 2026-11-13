import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SEED_SPOTIFY_ITEMS,
  buildSpotifyEmbedUrl,
  parseSpotifyInput,
} from './spotifyCatalog';

test('SEED_SPOTIFY_ITEMS includes curated playlists and tracks', () => {
  const playlists = SEED_SPOTIFY_ITEMS.filter((i) => i.kind === 'playlist');
  const tracks = SEED_SPOTIFY_ITEMS.filter((i) => i.kind === 'track');
  assert.ok(playlists.length >= 6);
  assert.ok(tracks.length >= 10);
});

test('parseSpotifyInput parses standard URLs, intl URLs, embed URLs, and URIs', () => {
  assert.deepEqual(
    parseSpotifyInput('https://open.spotify.com/track/3be9ACTxtcL6Zm4vJRUiPG?si=abc123'),
    { kind: 'track', spotifyId: '3be9ACTxtcL6Zm4vJRUiPG' }
  );
  assert.deepEqual(
    parseSpotifyInput('https://open.spotify.com/intl-en/playlist/0vvXsWCC9xrXsKd4FyS8kM'),
    { kind: 'playlist', spotifyId: '0vvXsWCC9xrXsKd4FyS8kM' }
  );
  assert.deepEqual(
    parseSpotifyInput('spotify:album:1NAmidJlEaVgA3MpcPFYGq'),
    { kind: 'album', spotifyId: '1NAmidJlEaVgA3MpcPFYGq' }
  );
  assert.equal(parseSpotifyInput('https://example.com/track/3be9ACTxtcL6Zm4vJRUiPG'), null);
  assert.equal(parseSpotifyInput('not a url'), null);
});

test('buildSpotifyEmbedUrl generates dark theme generator embed URL', () => {
  assert.equal(
    buildSpotifyEmbedUrl('track', '3be9ACTxtcL6Zm4vJRUiPG'),
    'https://open.spotify.com/embed/track/3be9ACTxtcL6Zm4vJRUiPG?utm_source=generator&theme=0'
  );
});
