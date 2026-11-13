import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SEED_VIDEOS,
  SEED_SOUNDS,
  filterVideos,
  mergeSeedWithStored,
  sanitizeTitle,
  isSafeMediaUrl,
  type VideoEntry,
} from './mediaCatalog';

test('all seeded video spaces use local direct_video MP4 assets and local thumbnails', () => {
  const videoSpaces = SEED_VIDEOS.filter((v) => v.contentType === 'direct_video');
  assert.equal(videoSpaces.length, 12);
  for (const space of videoSpaces) {
    assert.ok(space.contentUrl.startsWith('/videos/') && space.contentUrl.endsWith('.mp4'), space.id);
    assert.ok(space.thumbnailUrl.startsWith('/videos/thumbs/') && space.thumbnailUrl.endsWith('.jpg'), space.id);
  }
});

test('sound catalog includes 12 copyright-free tracks with local mp3 URLs', () => {
  assert.equal(SEED_SOUNDS.length, 12);
  const ids = new Set(SEED_SOUNDS.map((s) => s.id));
  assert.equal(ids.size, 12);
  for (const sound of SEED_SOUNDS) {
    assert.ok(sound.url.startsWith('/sounds/') && sound.url.endsWith('.mp3'), sound.id);
    assert.ok(sound.license.includes('Royalty-Free'), sound.id);
  }
});

test('filterVideos filters by category, Trending, New Spaces, and search query', () => {
  const cafes = filterVideos(SEED_VIDEOS, '', 'Cafes');
  assert.ok(cafes.length >= 2);
  assert.ok(cafes.every((v) => v.category === 'Cafes'));

  const trending = filterVideos(SEED_VIDEOS, '', 'Trending');
  assert.ok(trending.length >= 4);
  assert.ok(trending.every((v) => v.isTrending));

  const searched = filterVideos(SEED_VIDEOS, 'hogwarts');
  assert.equal(searched.length, 1);
  assert.equal(searched[0].id, 'cozy-library');
});

test('mergeSeedWithStored upgrades legacy YouTube entries to local MP4 while preserving view counts and custom items', () => {
  const legacy: VideoEntry[] = [
    {
      ...SEED_VIDEOS[0],
      contentType: 'youtube',
      contentUrl: '5yx6BWlEVcY',
      thumbnailUrl: 'https://img.youtube.com/vi/5yx6BWlEVcY/mqdefault.jpg',
      viewCount: 99999,
    },
    {
      id: 'custom-1',
      title: 'My Custom Room',
      description: 'Custom',
      category: 'Custom',
      tags: ['custom'],
      thumbnailUrl: '/videos/thumbs/lofi-cafe.jpg',
      contentUrl: '/videos/lofi-cafe.mp4',
      contentType: 'direct_video',
      uploadDate: '2025-03-01',
      viewCount: 5,
      status: 'active',
      isFeatured: false,
      isTrending: false,
      isNew: true,
      isCustom: true,
    },
  ];

  const merged = mergeSeedWithStored(legacy);
  const upgraded = merged.find((v) => v.id === 'lofi-cafe');
  assert.equal(upgraded?.contentType, 'direct_video');
  assert.equal(upgraded?.contentUrl, '/videos/lofi-cafe.mp4');
  assert.equal(upgraded?.viewCount, 99999);
  assert.ok(merged.some((v) => v.id === 'custom-1'));
});

test('sanitizeTitle and isSafeMediaUrl prevent unsafe values', () => {
  assert.equal(sanitizeTitle('  <script>Cafe</script>  '), 'scriptCafe/script');
  assert.equal(sanitizeTitle('   ', 'Fallback'), 'Fallback');
  assert.equal(isSafeMediaUrl('/videos/lofi-cafe.mp4'), true);
  assert.equal(isSafeMediaUrl('https://example.com/bg.mp4'), true);
  assert.equal(isSafeMediaUrl('javascript:alert(1)'), false);
  assert.equal(isSafeMediaUrl('//evil.example/x.mp4'), false);
});
