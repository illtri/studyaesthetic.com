/**
 * VideoDatabase.ts
 * ─────────────────────────────────────────────────────────────────
 * Client-side video/background database for StudyAesthetic.
 *
 * Stores all background videos (YouTube + static images) with full
 * metadata. Seeded with the 12 existing spaces + static background
 * categories. Designed for drop-in Supabase migration.
 *
 * SUPABASE MIGRATION PATH (future):
 *   Table: `videos` with RLS policies
 *   supabase.from('videos').select('*').eq('status', 'active')
 */

// ─── Types ─────────────────────────────────────────────────────────

export type VideoStatus   = 'active' | 'inactive' | 'pending_review';
export type ContentType   = 'youtube' | 'direct_video' | 'image';
export type BackgroundCat =
  | 'Cafes'
  | 'Cozy Rooms'
  | 'Nature & Rain'
  | 'City & Travel'
  | 'Minimal'
  | 'Nature'
  | 'Aesthetic'
  | 'Dark Mode'
  | 'Abstract'
  | 'Custom';

export interface VideoEntry {
  id:           string;
  title:        string;
  description:  string;
  category:     BackgroundCat;
  tags:         string[];
  thumbnailUrl: string;
  contentUrl:   string;           // YouTube video ID or direct URL or image URL
  contentType:  ContentType;
  duration?:    number;           // seconds (undefined for images/streams)
  resolution?:  string;          // e.g. "1920x1080"
  uploadDate:   string;           // ISO date
  viewCount:    number;
  creatorInfo?: string;
  status:       VideoStatus;
  isFeatured:   boolean;
  isTrending:   boolean;
  isNew:        boolean;
  activeUsers?: string;           // display string e.g. "4.8k"
  presetSounds?: Record<string, number>;  // soundId → volume 0-100
  isCustom?:    boolean;          // user-uploaded content
  isUserFavorite?: boolean;       // runtime flag (not persisted here)
}

export interface BackgroundCollection {
  id:          string;
  title:       string;
  description: string;
  itemIds:     string[];
  createdAt:   string;
  isPublic:    boolean;
}

// ─── Storage key ───────────────────────────────────────────────────

const DB_KEY          = 'sa_video_db_v1';
const CUSTOM_KEY      = 'sa_custom_backgrounds_v1';
const COLLECTIONS_KEY = 'sa_bg_collections_v1';

// ─── Seed Data ─────────────────────────────────────────────────────

const SEED_VIDEOS: VideoEntry[] = [
  // ── YouTube Spaces ────────────────────────────────────────────
  {
    id: 'lofi-cafe',
    title: 'Lo-Fi Cafe Vibes',
    description: 'A warm, cozy cafe ambiance perfect for deep work and creative flow.',
    category: 'Cafes',
    tags: ['lofi', 'cafe', 'cozy', 'warm', 'aesthetic'],
    thumbnailUrl: 'https://img.youtube.com/vi/hBGwt25cJRY/mqdefault.jpg',
    contentUrl: 'hBGwt25cJRY',
    contentType: 'youtube',
    uploadDate: '2024-01-01',
    viewCount: 48000,
    creatorInfo: 'StudyAesthetic',
    status: 'active',
    isFeatured: true,
    isTrending: true,
    isNew: false,
    activeUsers: '4.8k',
    presetSounds: { lofi: 60, cafe: 40, rain: 20 },
  },
  {
    id: 'tokyo-rain',
    title: 'Cozy Tokyo Rain Cafe',
    description: 'Tokyo streets in the rain, viewed from a cozy cafe window.',
    category: 'City & Travel',
    tags: ['tokyo', 'rain', 'japan', 'city', 'cafe'],
    thumbnailUrl: 'https://img.youtube.com/vi/5Wq1P1R7UaA/mqdefault.jpg',
    contentUrl: '5Wq1P1R7UaA',
    contentType: 'youtube',
    uploadDate: '2024-01-05',
    viewCount: 32000,
    status: 'active',
    isFeatured: true,
    isTrending: true,
    isNew: false,
    activeUsers: '3.2k',
    presetSounds: { rain: 70, keyboard: 30, lofi: 20 },
  },
  {
    id: 'cozy-library',
    title: 'Aesthetic Hogwarts Library',
    description: 'Study in the magical library atmosphere of Hogwarts.',
    category: 'Cozy Rooms',
    tags: ['library', 'hogwarts', 'magic', 'books', 'cozy'],
    thumbnailUrl: 'https://img.youtube.com/vi/4vIQON2fDWM/mqdefault.jpg',
    contentUrl: '4vIQON2fDWM',
    contentType: 'youtube',
    uploadDate: '2024-01-08',
    viewCount: 21000,
    status: 'active',
    isFeatured: true,
    isTrending: true,
    isNew: false,
    activeUsers: '2.1k',
    presetSounds: { keyboard: 40, lofi: 10 },
  },
  {
    id: 'rainy-window',
    title: 'Windowpane Autumn Rain',
    description: 'Peaceful autumn rain on a windowpane — instant focus.',
    category: 'Nature & Rain',
    tags: ['rain', 'autumn', 'window', 'nature', 'peaceful'],
    thumbnailUrl: 'https://img.youtube.com/vi/mPfS3Vf7Q2U/mqdefault.jpg',
    contentUrl: 'mPfS3Vf7Q2U',
    contentType: 'youtube',
    uploadDate: '2024-02-01',
    viewCount: 15000,
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: true,
    activeUsers: '1.5k',
    presetSounds: { rain: 80, lofi: 20 },
  },
  {
    id: 'anime-study',
    title: 'Anime Girl Bedroom Workspace',
    description: 'Cozy anime study room with a lo-fi aesthetic.',
    category: 'Cozy Rooms',
    tags: ['anime', 'lofi', 'bedroom', 'cozy', 'aesthetic'],
    thumbnailUrl: 'https://img.youtube.com/vi/8qLh17e8N1E/mqdefault.jpg',
    contentUrl: '8qLh17e8N1E',
    contentType: 'youtube',
    uploadDate: '2024-02-05',
    viewCount: 54000,
    status: 'active',
    isFeatured: true,
    isTrending: false,
    isNew: true,
    activeUsers: '5.4k',
    presetSounds: { lofi: 80 },
  },
  {
    id: 'winter-train',
    title: 'Swiss Winter Express Train',
    description: 'Scenic Swiss Alps train ride through snowy landscapes.',
    category: 'City & Travel',
    tags: ['train', 'winter', 'switzerland', 'snow', 'travel'],
    thumbnailUrl: 'https://img.youtube.com/vi/2zVlh56lWsw/mqdefault.jpg',
    contentUrl: '2zVlh56lWsw',
    contentType: 'youtube',
    uploadDate: '2024-02-10',
    viewCount: 9200,
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: true,
    activeUsers: '920',
    presetSounds: { lofi: 50, keyboard: 30 },
  },
  {
    id: 'forest-cabin',
    title: 'Rainy Cabin Fireplace',
    description: 'A cozy forest cabin with a crackling fireplace during rain.',
    category: 'Nature & Rain',
    tags: ['cabin', 'fireplace', 'rain', 'forest', 'cozy'],
    thumbnailUrl: 'https://img.youtube.com/vi/A2p5sP5t3Xw/mqdefault.jpg',
    contentUrl: 'A2p5sP5t3Xw',
    contentType: 'youtube',
    uploadDate: '2024-01-20',
    viewCount: 29000,
    status: 'active',
    isFeatured: false,
    isTrending: true,
    isNew: false,
    activeUsers: '2.9k',
    presetSounds: { campfire: 70, rain: 40, birds: 20 },
  },
  {
    id: 'observatory',
    title: 'Night Sky Observatory',
    description: 'Stargazing from a mountain observatory under the Milky Way.',
    category: 'Nature & Rain',
    tags: ['space', 'stars', 'observatory', 'night', 'astronomy'],
    thumbnailUrl: 'https://img.youtube.com/vi/b83h2iW3Xf0/mqdefault.jpg',
    contentUrl: 'b83h2iW3Xf0',
    contentType: 'youtube',
    uploadDate: '2024-01-25',
    viewCount: 6400,
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: false,
    activeUsers: '640',
    presetSounds: { lofi: 40 },
  },
  {
    id: 'cyberpunk-apt',
    title: 'Cyberpunk Rain Apartment',
    description: 'A cyberpunk apartment at night with neon lights and rain.',
    category: 'Cozy Rooms',
    tags: ['cyberpunk', 'neon', 'rain', 'city', 'aesthetic'],
    thumbnailUrl: 'https://img.youtube.com/vi/S19024D9m0w/mqdefault.jpg',
    contentUrl: 'S19024D9m0w',
    contentType: 'youtube',
    uploadDate: '2024-01-15',
    viewCount: 37000,
    status: 'active',
    isFeatured: false,
    isTrending: true,
    isNew: false,
    activeUsers: '3.7k',
    presetSounds: { lofi: 50, rain: 40 },
  },
  {
    id: 'zen-garden',
    title: 'Zen Rain Garden & Koi Pond',
    description: 'A Japanese zen garden in the gentle rain.',
    category: 'Nature & Rain',
    tags: ['zen', 'japan', 'garden', 'koi', 'rain', 'peaceful'],
    thumbnailUrl: 'https://img.youtube.com/vi/5m0L16Qd7zE/mqdefault.jpg',
    contentUrl: '5m0L16Qd7zE',
    contentType: 'youtube',
    uploadDate: '2024-01-30',
    viewCount: 11000,
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: false,
    activeUsers: '1.1k',
    presetSounds: { birds: 50, rain: 30 },
  },
  {
    id: 'starbucks-rain',
    title: 'Rainy Coffee Shop Front',
    description: 'Rain falling outside a cozy coffee shop window.',
    category: 'Cafes',
    tags: ['coffee', 'rain', 'window', 'cafe', 'cozy'],
    thumbnailUrl: 'https://img.youtube.com/vi/uxR_A5z8J_A/mqdefault.jpg',
    contentUrl: 'uxR_A5z8J_A',
    contentType: 'youtube',
    uploadDate: '2024-01-12',
    viewCount: 25000,
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: false,
    activeUsers: '2.5k',
    presetSounds: { cafe: 60, rain: 40 },
  },
  {
    id: 'aurora-camp',
    title: 'Aurora Camping Fire',
    description: 'Campfire under the northern lights — awe-inspiring focus.',
    category: 'Nature & Rain',
    tags: ['aurora', 'campfire', 'nordic', 'camping', 'nature'],
    thumbnailUrl: 'https://img.youtube.com/vi/s2e9Z5_K80Q/mqdefault.jpg',
    contentUrl: 's2e9Z5_K80Q',
    contentType: 'youtube',
    uploadDate: '2024-02-15',
    viewCount: 8800,
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: true,
    activeUsers: '880',
    presetSounds: { campfire: 80, birds: 10 },
  },

  // ── Static Image Backgrounds ──────────────────────────────────
  {
    id: 'static-minimal-dark',
    title: 'Minimal Dark Gradient',
    description: 'Clean minimal dark background for distraction-free focus.',
    category: 'Minimal',
    tags: ['minimal', 'dark', 'clean', 'gradient'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80',
    contentUrl:   'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1920&q=90',
    contentType:  'image',
    uploadDate:   '2024-01-01',
    viewCount:    5000,
    status:       'active',
    isFeatured:   true,
    isTrending:   false,
    isNew:        false,
  },
  {
    id: 'static-forest',
    title: 'Misty Forest Morning',
    description: 'A foggy forest path in the early morning light.',
    category: 'Nature',
    tags: ['forest', 'nature', 'misty', 'morning', 'green'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80',
    contentUrl:   'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=90',
    contentType:  'image',
    uploadDate:   '2024-01-01',
    viewCount:    3800,
    status:       'active',
    isFeatured:   false,
    isTrending:   false,
    isNew:        false,
  },
  {
    id: 'static-ocean',
    title: 'Ocean Sunset',
    description: 'Warm ocean horizon at golden hour.',
    category: 'Nature',
    tags: ['ocean', 'sunset', 'waves', 'horizon', 'warm'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
    contentUrl:   'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=90',
    contentType:  'image',
    uploadDate:   '2024-01-01',
    viewCount:    4200,
    status:       'active',
    isFeatured:   false,
    isTrending:   false,
    isNew:        false,
  },
  {
    id: 'static-abstract-purple',
    title: 'Purple Nebula',
    description: 'Abstract cosmic purple gradient — feels like deep focus.',
    category: 'Abstract',
    tags: ['abstract', 'purple', 'gradient', 'cosmic', 'nebula'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&q=80',
    contentUrl:   'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=90',
    contentType:  'image',
    uploadDate:   '2024-01-01',
    viewCount:    6700,
    status:       'active',
    isFeatured:   true,
    isTrending:   true,
    isNew:        false,
  },
  {
    id: 'static-library-books',
    title: 'Warm Library Shelves',
    description: 'Warm-toned library book shelves — the scent of learning.',
    category: 'Aesthetic',
    tags: ['library', 'books', 'warm', 'aesthetic', 'learning'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&q=80',
    contentUrl:   'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&q=90',
    contentType:  'image',
    uploadDate:   '2024-01-01',
    viewCount:    8200,
    status:       'active',
    isFeatured:   true,
    isTrending:   false,
    isNew:        false,
  },
  {
    id: 'static-dark-desk',
    title: 'Minimal Dark Desk',
    description: 'A clean dark desktop setup for productivity.',
    category: 'Dark Mode',
    tags: ['desk', 'dark', 'minimal', 'productivity', 'setup'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80',
    contentUrl:   'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1920&q=90',
    contentType:  'image',
    uploadDate:   '2024-01-01',
    viewCount:    5400,
    status:       'active',
    isFeatured:   false,
    isTrending:   false,
    isNew:        false,
  },
];

// ─── Database Init ─────────────────────────────────────────────────

function initDB(): VideoEntry[] {
  const stored = localStorage.getItem(DB_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  // First run — seed with defaults
  localStorage.setItem(DB_KEY, JSON.stringify(SEED_VIDEOS));
  return SEED_VIDEOS;
}

function saveDB(videos: VideoEntry[]) {
  try { localStorage.setItem(DB_KEY, JSON.stringify(videos)); } catch {}
}

// ─── CRUD Operations ───────────────────────────────────────────────

export function getAllVideos(): VideoEntry[] {
  if (typeof localStorage === 'undefined') return SEED_VIDEOS;
  return initDB();
}

export function getVideo(id: string): VideoEntry | undefined {
  return getAllVideos().find(v => v.id === id);
}

export function getActiveVideos(): VideoEntry[] {
  return getAllVideos().filter(v => v.status === 'active');
}

export function getFeaturedVideos(): VideoEntry[] {
  return getActiveVideos().filter(v => v.isFeatured);
}

export function getTrendingVideos(): VideoEntry[] {
  return getActiveVideos().filter(v => v.isTrending);
}

export function getNewVideos(): VideoEntry[] {
  return getActiveVideos().filter(v => v.isNew);
}

export function getByCategory(category: BackgroundCat): VideoEntry[] {
  return getActiveVideos().filter(v => v.category === category);
}

export function getByContentType(type: ContentType): VideoEntry[] {
  return getActiveVideos().filter(v => v.contentType === type);
}

export function getCustomUploads(): VideoEntry[] {
  const custom = localStorage.getItem(CUSTOM_KEY);
  try { return custom ? JSON.parse(custom) : []; } catch { return []; }
}

export function searchVideos(query: string): VideoEntry[] {
  const q   = query.toLowerCase().trim();
  if (!q) return getActiveVideos();
  return getActiveVideos().filter(v =>
    v.title.toLowerCase().includes(q) ||
    v.description.toLowerCase().includes(q) ||
    v.tags.some(t => t.includes(q)) ||
    v.category.toLowerCase().includes(q)
  );
}

export function addVideo(video: Omit<VideoEntry, 'id' | 'uploadDate' | 'viewCount'>): VideoEntry {
  const videos = getAllVideos();
  const newVideo: VideoEntry = {
    ...video,
    id:         `custom-${Date.now()}`,
    uploadDate: new Date().toISOString().split('T')[0],
    viewCount:  0,
  };
  videos.push(newVideo);
  saveDB(videos);
  return newVideo;
}

export function updateVideo(id: string, updates: Partial<VideoEntry>): VideoEntry | null {
  const videos = getAllVideos();
  const idx    = videos.findIndex(v => v.id === id);
  if (idx < 0) return null;
  videos[idx] = { ...videos[idx], ...updates };
  saveDB(videos);
  return videos[idx];
}

export function deleteVideo(id: string): boolean {
  const videos  = getAllVideos();
  const filtered = videos.filter(v => v.id !== id);
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
    id:           `upload-${Date.now()}`,
    title:        name,
    description:  'Custom upload',
    category,
    tags:         ['custom', 'upload'],
    thumbnailUrl: thumbnailUrl || url,
    contentUrl:   url,
    contentType:  type,
    uploadDate:   new Date().toISOString().split('T')[0],
    viewCount:    0,
    status:       'active',
    isFeatured:   false,
    isTrending:   false,
    isNew:        true,
    isCustom:     true,
  };

  const customs = getCustomUploads();
  customs.unshift(custom);
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(customs.slice(0, 50)));
  return custom;
}

export function removeCustomUpload(id: string) {
  const customs  = getCustomUploads();
  const filtered = customs.filter((c: VideoEntry) => c.id !== id);
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(filtered));
}

// ─── Collections ───────────────────────────────────────────────────

export function getCollections(): BackgroundCollection[] {
  try {
    const stored = localStorage.getItem(COLLECTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function createCollection(title: string, description = ''): BackgroundCollection {
  const collections = getCollections();
  const col: BackgroundCollection = {
    id:          `col-${Date.now()}`,
    title,
    description,
    itemIds:     [],
    createdAt:   new Date().toISOString(),
    isPublic:    false,
  };
  collections.push(col);
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  return col;
}

export function addToCollection(collectionId: string, videoId: string) {
  const collections = getCollections();
  const col         = collections.find(c => c.id === collectionId);
  if (!col || col.itemIds.includes(videoId)) return;
  col.itemIds.push(videoId);
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
}

// ─── Available Categories ──────────────────────────────────────────

export const VIDEO_CATEGORIES: BackgroundCat[] = [
  'Cafes', 'Cozy Rooms', 'Nature & Rain', 'City & Travel',
];

export const STATIC_CATEGORIES: BackgroundCat[] = [
  'Minimal', 'Nature', 'Aesthetic', 'Dark Mode', 'Abstract',
];

export const ALL_CATEGORIES = [...VIDEO_CATEGORIES, ...STATIC_CATEGORIES, 'Custom' as BackgroundCat];
