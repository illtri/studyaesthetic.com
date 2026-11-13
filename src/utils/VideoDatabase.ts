/**
 * VideoDatabase.ts
 * ─────────────────────────────────────────────────────────────────
 * Client-side video/background database & instant-start media cache
 * for StudyAesthetic. Syncs with `/api/videos` and pre-warms MP4
 * spaces into Cache Storage / IndexedDB so video switching is instant.
 */

import {
  ALL_CATEGORIES,
  SEED_VIDEOS,
  STATIC_CATEGORIES,
  VIDEO_CATEGORIES,
  filterVideos,
  mergeSeedWithStored,
  type BackgroundCat,
  type BackgroundCollection,
  type ContentType,
  type VideoEntry,
  type VideoStatus,
} from './mediaCatalog';

export type {
  BackgroundCat,
  BackgroundCollection,
  ContentType,
  VideoEntry,
  VideoStatus,
};

export { ALL_CATEGORIES, STATIC_CATEGORIES, VIDEO_CATEGORIES };

const DB_KEY = 'sa_video_db_v2';
const LEGACY_DB_KEY = 'sa_video_db_v1';
const CUSTOM_KEY = 'sa_custom_backgrounds_v1';
const COLLECTIONS_KEY = 'sa_bg_collections_v1';
const CACHE_NAME = 'sa-video-assets-v1';

// ─── Database Init ─────────────────────────────────────────────────

function initDB(): VideoEntry[] {
  try {
    const stored = localStorage.getItem(DB_KEY) || localStorage.getItem(LEGACY_DB_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        const merged = mergeSeedWithStored(parsed);
        localStorage.setItem(DB_KEY, JSON.stringify(merged));
        return merged;
      }
    }
  } catch {}
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(SEED_VIDEOS));
  } catch {}
  return SEED_VIDEOS;
}

function saveDB(videos: VideoEntry[]) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(videos));
  } catch {}
}

// ─── Sync & Instant Pre-caching ────────────────────────────────────

export async function syncVideosFromServer(): Promise<VideoEntry[]> {
  if (typeof window === 'undefined') return SEED_VIDEOS;
  try {
    const res = await fetch('/api/videos', { cache: 'no-store' });
    if (!res.ok) return getAllVideos();
    const data = (await res.json()) as { videos?: VideoEntry[] };
    if (Array.isArray(data.videos)) {
      const merged = mergeSeedWithStored(data.videos);
      saveDB(merged);
      return merged;
    }
  } catch {}
  return getAllVideos();
}

export async function getCachedVideoUrl(url: string): Promise<string> {
  if (typeof window === 'undefined' || !url.startsWith('/videos/') || !('caches' in window)) {
    return url;
  }
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(url);
    if (cached) {
      const blob = await cached.blob();
      return URL.createObjectURL(blob);
    }
    const resp = await fetch(url);
    if (resp.ok) {
      await cache.put(url, resp.clone());
      const blob = await resp.blob();
      return URL.createObjectURL(blob);
    }
  } catch {}
  return url;
}

export async function warmVideoCache(urls: string[]): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  try {
    const cache = await caches.open(CACHE_NAME);
    for (const url of urls) {
      if (!url.startsWith('/videos/')) continue;
      const hit = await cache.match(url);
      if (!hit) {
        const resp = await fetch(url);
        if (resp.ok) await cache.put(url, resp);
      }
    }
  } catch {}
}

export function recordVideoView(id: string) {
  incrementViewCount(id);
  if (typeof window !== 'undefined') {
    fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'view', id }),
    }).catch(() => {});
  }
}

// ─── CRUD Operations ───────────────────────────────────────────────

export function getAllVideos(): VideoEntry[] {
  if (typeof localStorage === 'undefined') return SEED_VIDEOS;
  return initDB();
}

export function getVideo(id: string): VideoEntry | undefined {
  return getAllVideos().find((v) => v.id === id);
}

export function getActiveVideos(): VideoEntry[] {
  return getAllVideos().filter((v) => v.status === 'active');
}

export function getFeaturedVideos(): VideoEntry[] {
  return getActiveVideos().filter((v) => v.isFeatured);
}

export function getTrendingVideos(): VideoEntry[] {
  return getActiveVideos().filter((v) => v.isTrending);
}

export function getNewVideos(): VideoEntry[] {
  return getActiveVideos().filter((v) => v.isNew);
}

export function getByCategory(category: BackgroundCat): VideoEntry[] {
  return getActiveVideos().filter((v) => v.category === category);
}

export function getByContentType(type: ContentType): VideoEntry[] {
  return getActiveVideos().filter((v) => v.contentType === type);
}

export function getCustomUploads(): VideoEntry[] {
  if (typeof localStorage === 'undefined') return [];
  const custom = localStorage.getItem(CUSTOM_KEY);
  try {
    return custom ? JSON.parse(custom) : [];
  } catch {
    return [];
  }
}

export function searchVideos(query: string): VideoEntry[] {
  return filterVideos(getActiveVideos(), query);
}

export function addVideo(video: Omit<VideoEntry, 'id' | 'uploadDate' | 'viewCount'>): VideoEntry {
  const videos = getAllVideos();
  const newVideo: VideoEntry = {
    ...video,
    id: `custom-${Date.now()}`,
    uploadDate: new Date().toISOString().split('T')[0],
    viewCount: 0,
  };
  videos.push(newVideo);
  saveDB(videos);
  return newVideo;
}

export function updateVideo(id: string, updates: Partial<VideoEntry>): VideoEntry | null {
  const videos = getAllVideos();
  const idx = videos.findIndex((v) => v.id === id);
  if (idx < 0) return null;
  videos[idx] = { ...videos[idx], ...updates };
  saveDB(videos);
  return videos[idx];
}

export function deleteVideo(id: string): boolean {
  const videos = getAllVideos();
  const filtered = videos.filter((v) => v.id !== id);
  if (filtered.length === videos.length) return false;
  saveDB(filtered);
  return true;
}

export function incrementViewCount(id: string) {
  updateVideo(id, { viewCount: (getVideo(id)?.viewCount ?? 0) + 1 });
}

export function addCustomUpload(
  name: string,
  url: string,
  type: ContentType,
  thumbnailUrl?: string,
  category: BackgroundCat = 'Custom'
): VideoEntry {
  const custom: VideoEntry = {
    id: `upload-${Date.now()}`,
    title: name,
    description: 'Custom upload',
    category,
    tags: ['custom', 'upload'],
    thumbnailUrl: thumbnailUrl || url,
    contentUrl: url,
    contentType: type,
    uploadDate: new Date().toISOString().split('T')[0],
    viewCount: 0,
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: true,
    isCustom: true,
  };

  const customs = getCustomUploads();
  customs.unshift(custom);
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(customs.slice(0, 50)));
  return custom;
}

export function removeCustomUpload(id: string) {
  const customs = getCustomUploads();
  const filtered = customs.filter((c: VideoEntry) => c.id !== id);
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(filtered));
}

// ─── Collections ───────────────────────────────────────────────────

export function getCollections(): BackgroundCollection[] {
  try {
    const stored = localStorage.getItem(COLLECTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function createCollection(title: string, description = ''): BackgroundCollection {
  const collections = getCollections();
  const col: BackgroundCollection = {
    id: `col-${Date.now()}`,
    title,
    description,
    itemIds: [],
    createdAt: new Date().toISOString(),
    isPublic: false,
  };
  collections.push(col);
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  return col;
}

export function addToCollection(collectionId: string, videoId: string) {
  const collections = getCollections();
  const col = collections.find((c) => c.id === collectionId);
  if (!col || col.itemIds.includes(videoId)) return;
  col.itemIds.push(videoId);
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
}
