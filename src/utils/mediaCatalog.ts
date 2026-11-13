export type VideoStatus = 'active' | 'inactive' | 'pending_review';
export type ContentType = 'direct_video' | 'image' | 'youtube';
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
  id: string;
  title: string;
  description: string;
  category: BackgroundCat;
  tags: string[];
  thumbnailUrl: string;
  contentUrl: string;
  contentType: ContentType;
  duration?: number;
  resolution?: string;
  uploadDate: string;
  viewCount: number;
  creatorInfo?: string;
  status: VideoStatus;
  isFeatured: boolean;
  isTrending: boolean;
  isNew: boolean;
  activeUsers?: string;
  presetSounds?: Record<string, number>;
  isCustom?: boolean;
  isUserFavorite?: boolean;
}

export interface SoundEntry {
  id: string;
  name: string;
  icon: string;
  category: 'Music' | 'Nature' | 'Ambience' | 'Focus';
  url: string;
  license: string;
  duration: number;
}

export interface BackgroundCollection {
  id: string;
  title: string;
  description: string;
  itemIds: string[];
  createdAt: string;
  isPublic: boolean;
}

export const SEED_VIDEOS: VideoEntry[] = [
  {
    id: 'lofi-cafe',
    title: 'Lo-Fi Cafe Vibes',
    description: 'A warm, cozy cafe ambiance perfect for deep work and creative flow.',
    category: 'Cafes',
    tags: ['lofi', 'cafe', 'cozy', 'warm', 'aesthetic'],
    thumbnailUrl: '/videos/thumbs/lofi-cafe.jpg',
    contentUrl: '/videos/lofi-cafe.mp4',
    contentType: 'direct_video',
    duration: 6,
    resolution: '1280x720',
    uploadDate: '2025-01-01',
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
    thumbnailUrl: '/videos/thumbs/tokyo-rain.jpg',
    contentUrl: '/videos/tokyo-rain.mp4',
    contentType: 'direct_video',
    duration: 6,
    resolution: '1280x720',
    uploadDate: '2025-01-05',
    viewCount: 32000,
    creatorInfo: 'StudyAesthetic',
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
    description: 'Study in the magical library atmosphere with warm candlelight.',
    category: 'Cozy Rooms',
    tags: ['library', 'hogwarts', 'magic', 'books', 'cozy'],
    thumbnailUrl: '/videos/thumbs/cozy-library.jpg',
    contentUrl: '/videos/cozy-library.mp4',
    contentType: 'direct_video',
    duration: 6,
    resolution: '1280x720',
    uploadDate: '2025-01-08',
    viewCount: 21000,
    creatorInfo: 'StudyAesthetic',
    status: 'active',
    isFeatured: true,
    isTrending: true,
    isNew: false,
    activeUsers: '2.1k',
    presetSounds: { keyboard: 40, piano: 35 },
  },
  {
    id: 'rainy-window',
    title: 'Windowpane Autumn Rain',
    description: 'Peaceful autumn rain on a windowpane — instant focus.',
    category: 'Nature & Rain',
    tags: ['rain', 'autumn', 'window', 'nature', 'peaceful'],
    thumbnailUrl: '/videos/thumbs/rainy-window.jpg',
    contentUrl: '/videos/rainy-window.mp4',
    contentType: 'direct_video',
    duration: 6,
    resolution: '1280x720',
    uploadDate: '2025-02-01',
    viewCount: 15000,
    creatorInfo: 'StudyAesthetic',
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: true,
    activeUsers: '1.5k',
    presetSounds: { rain: 75, thunder: 25, piano: 20 },
  },
  {
    id: 'anime-study',
    title: 'Anime Girl Bedroom Workspace',
    description: 'Cozy twilight study room with a lo-fi aesthetic.',
    category: 'Cozy Rooms',
    tags: ['anime', 'lofi', 'bedroom', 'cozy', 'aesthetic'],
    thumbnailUrl: '/videos/thumbs/anime-study.jpg',
    contentUrl: '/videos/anime-study.mp4',
    contentType: 'direct_video',
    duration: 6,
    resolution: '1280x720',
    uploadDate: '2025-02-05',
    viewCount: 54000,
    creatorInfo: 'StudyAesthetic',
    status: 'active',
    isFeatured: true,
    isTrending: false,
    isNew: true,
    activeUsers: '5.4k',
    presetSounds: { lofi: 75, piano: 25 },
  },
  {
    id: 'winter-train',
    title: 'Swiss Winter Express Train',
    description: 'Scenic winter express gliding through crisp alpine nights.',
    category: 'City & Travel',
    tags: ['train', 'winter', 'switzerland', 'snow', 'travel'],
    thumbnailUrl: '/videos/thumbs/winter-train.jpg',
    contentUrl: '/videos/winter-train.mp4',
    contentType: 'direct_video',
    duration: 6,
    resolution: '1280x720',
    uploadDate: '2025-02-10',
    viewCount: 9200,
    creatorInfo: 'StudyAesthetic',
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: true,
    activeUsers: '920',
    presetSounds: { wind: 40, synthwave: 35, keyboard: 25 },
  },
  {
    id: 'forest-cabin',
    title: 'Rainy Cabin Fireplace',
    description: 'A cozy forest cabin with a crackling fireplace during rain.',
    category: 'Nature & Rain',
    tags: ['cabin', 'fireplace', 'rain', 'forest', 'cozy'],
    thumbnailUrl: '/videos/thumbs/forest-cabin.jpg',
    contentUrl: '/videos/forest-cabin.mp4',
    contentType: 'direct_video',
    duration: 6,
    resolution: '1280x720',
    uploadDate: '2025-01-20',
    viewCount: 29000,
    creatorInfo: 'StudyAesthetic',
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
    thumbnailUrl: '/videos/thumbs/observatory.jpg',
    contentUrl: '/videos/observatory.mp4',
    contentType: 'direct_video',
    duration: 6,
    resolution: '1280x720',
    uploadDate: '2025-01-25',
    viewCount: 6400,
    creatorInfo: 'StudyAesthetic',
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: false,
    activeUsers: '640',
    presetSounds: { synthwave: 50, wind: 25 },
  },
  {
    id: 'cyberpunk-apt',
    title: 'Cyberpunk Rain Apartment',
    description: 'A futuristic apartment at night with neon skyline rain.',
    category: 'Cozy Rooms',
    tags: ['cyberpunk', 'neon', 'rain', 'city', 'aesthetic'],
    thumbnailUrl: '/videos/thumbs/cyberpunk-apt.jpg',
    contentUrl: '/videos/cyberpunk-apt.mp4',
    contentType: 'direct_video',
    duration: 6,
    resolution: '1280x720',
    uploadDate: '2025-01-15',
    viewCount: 37000,
    creatorInfo: 'StudyAesthetic',
    status: 'active',
    isFeatured: false,
    isTrending: true,
    isNew: false,
    activeUsers: '3.7k',
    presetSounds: { synthwave: 55, rain: 45, thunder: 20 },
  },
  {
    id: 'zen-garden',
    title: 'Zen Rain Garden & Koi Pond',
    description: 'A serene garden sanctuary in gentle mountain mist.',
    category: 'Nature & Rain',
    tags: ['zen', 'japan', 'garden', 'koi', 'rain', 'peaceful'],
    thumbnailUrl: '/videos/thumbs/zen-garden.jpg',
    contentUrl: '/videos/zen-garden.mp4',
    contentType: 'direct_video',
    duration: 6,
    resolution: '1280x720',
    uploadDate: '2025-01-30',
    viewCount: 11000,
    creatorInfo: 'StudyAesthetic',
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: false,
    activeUsers: '1.1k',
    presetSounds: { birds: 50, rain: 30, ocean: 25 },
  },
  {
    id: 'starbucks-rain',
    title: 'Rainy Coffee Shop Front',
    description: 'Rain falling outside a warm coffee shop window.',
    category: 'Cafes',
    tags: ['coffee', 'rain', 'window', 'cafe', 'cozy'],
    thumbnailUrl: '/videos/thumbs/starbucks-rain.jpg',
    contentUrl: '/videos/starbucks-rain.mp4',
    contentType: 'direct_video',
    duration: 6,
    resolution: '1280x720',
    uploadDate: '2025-01-12',
    viewCount: 25000,
    creatorInfo: 'StudyAesthetic',
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: false,
    activeUsers: '2.5k',
    presetSounds: { cafe: 60, rain: 40, piano: 20 },
  },
  {
    id: 'aurora-camp',
    title: 'Aurora Camping Fire',
    description: 'Campfire under the northern lights — awe-inspiring focus.',
    category: 'Nature & Rain',
    tags: ['aurora', 'campfire', 'nordic', 'camping', 'nature'],
    thumbnailUrl: '/videos/thumbs/aurora-camp.jpg',
    contentUrl: '/videos/aurora-camp.mp4',
    contentType: 'direct_video',
    duration: 6,
    resolution: '1280x720',
    uploadDate: '2025-02-15',
    viewCount: 8800,
    creatorInfo: 'StudyAesthetic',
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: true,
    activeUsers: '880',
    presetSounds: { campfire: 70, wind: 30, synthwave: 25 },
  },
  // ── Curated YouTube Live & Study Streams ──────────────────────
  {
    id: 'yt-chillhop-radio',
    title: 'Chillhop Radio — Jazzy & Lofi Beats',
    description: '24/7 jazzy and lofi hip hop radio stream by Chillhop Music.',
    category: 'Cafes',
    tags: ['youtube', 'live', 'chillhop', 'lofi', 'jazz', 'radio'],
    thumbnailUrl: 'https://i.ytimg.com/vi/5yx6BWlEVcY/hqdefault.jpg',
    contentUrl: '5yx6BWlEVcY',
    contentType: 'youtube',
    uploadDate: '2025-02-20',
    viewCount: 64000,
    creatorInfo: 'Chillhop Music',
    status: 'active',
    isFeatured: true,
    isTrending: true,
    isNew: true,
    activeUsers: '6.4k',
    presetSounds: { rain: 20, cafe: 25 },
  },
  {
    id: 'yt-synthwave-radio',
    title: 'Lofi Girl — Synthwave Radio',
    description: '24/7 retro synthwave beats to chill, code, or game to.',
    category: 'City & Travel',
    tags: ['youtube', 'live', 'lofi girl', 'synthwave', 'retro', 'coding'],
    thumbnailUrl: 'https://i.ytimg.com/vi/4xDzrJKXOOY/hqdefault.jpg',
    contentUrl: '4xDzrJKXOOY',
    contentType: 'youtube',
    uploadDate: '2025-02-20',
    viewCount: 58000,
    creatorInfo: 'Lofi Girl',
    status: 'active',
    isFeatured: true,
    isTrending: true,
    isNew: true,
    activeUsers: '5.8k',
    presetSounds: { keyboard: 25 },
  },
  {
    id: 'yt-1am-study',
    title: 'Lofi Girl — 1 A.M Study Session',
    description: 'Late-night animated study room session with deep lofi hip hop beats.',
    category: 'Cozy Rooms',
    tags: ['youtube', 'lofi girl', 'study session', 'night', 'anime', 'cozy'],
    thumbnailUrl: 'https://i.ytimg.com/vi/lTRiuFIWV54/hqdefault.jpg',
    contentUrl: 'lTRiuFIWV54',
    contentType: 'youtube',
    uploadDate: '2025-02-18',
    viewCount: 72000,
    creatorInfo: 'Lofi Girl',
    status: 'active',
    isFeatured: true,
    isTrending: true,
    isNew: false,
    activeUsers: '7.2k',
    presetSounds: { rain: 30 },
  },
  {
    id: 'yt-chillhop-study',
    title: 'Chillhop — Study & Relax Radio',
    description: 'Cozy animated raccoon desk stream with relaxing instrumental beats.',
    category: 'Cozy Rooms',
    tags: ['youtube', 'live', 'chillhop', 'study', 'relax', 'lofi'],
    thumbnailUrl: 'https://i.ytimg.com/vi/7NOSDKb0HlU/hqdefault.jpg',
    contentUrl: '7NOSDKb0HlU',
    contentType: 'youtube',
    uploadDate: '2025-02-19',
    viewCount: 41000,
    creatorInfo: 'Chillhop Music',
    status: 'active',
    isFeatured: false,
    isTrending: true,
    isNew: true,
    activeUsers: '4.1k',
    presetSounds: { rain: 20 },
  },
  {
    id: 'yt-lofi-sleep',
    title: 'Lofi Girl — Sleep & Chill Radio',
    description: '24/7 soothing ambient lofi stream in a peaceful night bedroom.',
    category: 'Cozy Rooms',
    tags: ['youtube', 'live', 'lofi girl', 'sleep', 'chill', 'night'],
    thumbnailUrl: 'https://i.ytimg.com/vi/DWcJFNfaw9c/hqdefault.jpg',
    contentUrl: 'DWcJFNfaw9c',
    contentType: 'youtube',
    uploadDate: '2025-02-17',
    viewCount: 39000,
    creatorInfo: 'Lofi Girl',
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: true,
    activeUsers: '3.9k',
    presetSounds: { rain: 25, wind: 15 },
  },
  {
    id: 'yt-best-of-lofi',
    title: 'Lofi Girl — Golden Hour Study Mix',
    description: 'Warm sunset study room with classic lofi hip hop instrumentals.',
    category: 'Cozy Rooms',
    tags: ['youtube', 'lofi girl', 'golden hour', 'study', 'warm'],
    thumbnailUrl: 'https://i.ytimg.com/vi/n61ULEU7CO0/hqdefault.jpg',
    contentUrl: 'n61ULEU7CO0',
    contentType: 'youtube',
    uploadDate: '2025-02-16',
    viewCount: 45000,
    creatorInfo: 'Lofi Girl',
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: false,
    activeUsers: '4.5k',
    presetSounds: { birds: 20 },
  },
  {
    id: 'yt-fireplace-4k',
    title: 'Cozy Fireplace Ambience 4K',
    description: 'Warm crackling hearth stream for deep reading and winter study.',
    category: 'Nature & Rain',
    tags: ['youtube', 'fireplace', 'cabin', 'cozy', 'warm', '4k'],
    thumbnailUrl: 'https://i.ytimg.com/vi/L_LUpnjgPso/hqdefault.jpg',
    contentUrl: 'L_LUpnjgPso',
    contentType: 'youtube',
    uploadDate: '2025-02-14',
    viewCount: 34000,
    creatorInfo: 'Fireplace Atmosphere',
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: true,
    activeUsers: '3.4k',
    presetSounds: { campfire: 65, rain: 30 },
  },
  {
    id: 'yt-classical-study',
    title: 'Classical Study Hall — Mozart & Vivaldi',
    description: 'Timeless classical masterpieces for deep concentration and reading.',
    category: 'Cafes',
    tags: ['youtube', 'classical', 'mozart', 'vivaldi', 'piano', 'study'],
    thumbnailUrl: 'https://i.ytimg.com/vi/BMuknRb7woc/hqdefault.jpg',
    contentUrl: 'BMuknRb7woc',
    contentType: 'youtube',
    uploadDate: '2025-02-12',
    viewCount: 51000,
    creatorInfo: 'Halidon Music',
    status: 'active',
    isFeatured: true,
    isTrending: true,
    isNew: false,
    activeUsers: '5.1k',
    presetSounds: { rain: 15 },
  },
  // ── Static Image Backgrounds ──────────────────────────────────
  {
    id: 'static-minimal-dark',
    title: 'Minimal Dark',
    description: 'Clean minimal dark background for distraction-free focus.',
    category: 'Minimal',
    tags: ['minimal', 'dark', 'clean', 'gradient'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80',
    contentUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1920&q=90',
    contentType: 'image',
    uploadDate: '2025-01-01',
    viewCount: 5000,
    status: 'active',
    isFeatured: true,
    isTrending: false,
    isNew: false,
  },
  {
    id: 'static-library-books',
    title: 'Warm Library',
    description: 'Warm-toned library book shelves — the scent of learning.',
    category: 'Aesthetic',
    tags: ['library', 'books', 'warm', 'aesthetic', 'learning'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&q=80',
    contentUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&q=90',
    contentType: 'image',
    uploadDate: '2025-01-01',
    viewCount: 8200,
    status: 'active',
    isFeatured: true,
    isTrending: false,
    isNew: false,
  },
  {
    id: 'static-forest',
    title: 'Misty Forest',
    description: 'A foggy forest path in the early morning light.',
    category: 'Nature',
    tags: ['forest', 'nature', 'misty', 'morning', 'green'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=80',
    contentUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=90',
    contentType: 'image',
    uploadDate: '2025-01-01',
    viewCount: 3800,
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: false,
  },
  {
    id: 'static-ocean',
    title: 'Ocean Sunset',
    description: 'Warm ocean horizon at golden hour.',
    category: 'Nature',
    tags: ['ocean', 'sunset', 'waves', 'horizon', 'warm'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
    contentUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=90',
    contentType: 'image',
    uploadDate: '2025-01-01',
    viewCount: 4200,
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: false,
  },
  {
    id: 'static-abstract-purple',
    title: 'Purple Nebula',
    description: 'Abstract cosmic purple gradient — feels like deep focus.',
    category: 'Abstract',
    tags: ['abstract', 'purple', 'gradient', 'cosmic', 'nebula'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&q=80',
    contentUrl: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1920&q=90',
    contentType: 'image',
    uploadDate: '2025-01-01',
    viewCount: 6700,
    status: 'active',
    isFeatured: true,
    isTrending: true,
    isNew: false,
  },
  {
    id: 'static-dark-desk',
    title: 'Dark Desk Setup',
    description: 'A clean dark desktop setup for productivity.',
    category: 'Dark Mode',
    tags: ['desk', 'dark', 'minimal', 'productivity', 'setup'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400&q=80',
    contentUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=1920&q=90',
    contentType: 'image',
    uploadDate: '2025-01-01',
    viewCount: 5400,
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: false,
  },
  {
    id: 'static-mountains',
    title: 'Snowy Mountains',
    description: 'Crisp mountain peaks overlooking an alpine valley.',
    category: 'Nature',
    tags: ['mountains', 'snow', 'alpine', 'nature'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80',
    contentUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=90',
    contentType: 'image',
    uploadDate: '2025-01-01',
    viewCount: 4100,
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: false,
  },
  {
    id: 'static-neon-city',
    title: 'Neon City Night',
    description: 'Atmospheric neon city street glow after dusk.',
    category: 'Aesthetic',
    tags: ['neon', 'city', 'night', 'aesthetic'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    contentUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=90',
    contentType: 'image',
    uploadDate: '2025-01-01',
    viewCount: 4900,
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: false,
  },
  {
    id: 'static-sakura',
    title: 'Cherry Blossoms',
    description: 'Soft spring sakura petals in gentle morning sunlight.',
    category: 'Aesthetic',
    tags: ['sakura', 'spring', 'blossom', 'aesthetic'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1522383225753-aa2895ea5b3e?w=400&q=80',
    contentUrl: 'https://images.unsplash.com/photo-1522383225753-aa2895ea5b3e?w=1920&q=90',
    contentType: 'image',
    uploadDate: '2025-01-01',
    viewCount: 5100,
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: false,
  },
  {
    id: 'static-space',
    title: 'Deep Space',
    description: 'Earth horizon illuminated from deep orbit.',
    category: 'Abstract',
    tags: ['space', 'orbit', 'dark', 'cosmos'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80',
    contentUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=90',
    contentType: 'image',
    uploadDate: '2025-01-01',
    viewCount: 4600,
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: false,
  },
  {
    id: 'static-coffee-table',
    title: 'Aesthetic Coffee',
    description: 'Minimal espresso pour over in quiet morning light.',
    category: 'Minimal',
    tags: ['coffee', 'minimal', 'desk', 'warm'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
    contentUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=90',
    contentType: 'image',
    uploadDate: '2025-01-01',
    viewCount: 3900,
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: false,
  },
  {
    id: 'static-dark-gradient',
    title: 'Ink Dark Gradient',
    description: 'Deep starry night sky silhouette for late-night study.',
    category: 'Dark Mode',
    tags: ['dark', 'stars', 'night', 'minimal'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80',
    contentUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=90',
    contentType: 'image',
    uploadDate: '2025-01-01',
    viewCount: 4300,
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: false,
  },
];

export const SEED_SOUNDS: SoundEntry[] = [
  { id: 'lofi',        name: 'Lofi Beats',       icon: '🎵', category: 'Music',    url: '/sounds/lofi.mp3',        license: 'Royalty-Free / CC0', duration: 180 },
  { id: 'piano',       name: 'Soft Study Piano', icon: '🎹', category: 'Music',    url: '/sounds/piano.mp3',       license: 'Royalty-Free / CC0', duration: 16  },
  { id: 'synthwave',   name: 'Midnight Pad',     icon: '🌌', category: 'Music',    url: '/sounds/synthwave.mp3',   license: 'Royalty-Free / CC0', duration: 16  },
  { id: 'rain',        name: 'Rainfall',         icon: '🌧️', category: 'Nature',   url: '/sounds/rain.mp3',        license: 'Royalty-Free / CC0', duration: 120 },
  { id: 'thunder',     name: 'Distant Thunder',  icon: '⛈️', category: 'Nature',   url: '/sounds/thunder.mp3',     license: 'Royalty-Free / CC0', duration: 16  },
  { id: 'ocean',       name: 'Ocean Waves',      icon: '🌊', category: 'Nature',   url: '/sounds/ocean.mp3',       license: 'Royalty-Free / CC0', duration: 16  },
  { id: 'wind',        name: 'Alpine Wind',      icon: '🍃', category: 'Nature',   url: '/sounds/wind.mp3',        license: 'Royalty-Free / CC0', duration: 16  },
  { id: 'birds',       name: 'Forest Birds',     icon: '🐦', category: 'Nature',   url: '/sounds/birds.mp3',       license: 'Royalty-Free / CC0', duration: 120 },
  { id: 'campfire',    name: 'Campfire',         icon: '🔥', category: 'Ambience', url: '/sounds/campfire.mp3',    license: 'Royalty-Free / CC0', duration: 60  },
  { id: 'cafe',        name: 'Cafe Vibe',        icon: '☕', category: 'Ambience', url: '/sounds/cafe.mp3',        license: 'Royalty-Free / CC0', duration: 120 },
  { id: 'keyboard',    name: 'Mechanical Keys',  icon: '⌨️', category: 'Focus',    url: '/sounds/keyboard.mp3',    license: 'Royalty-Free / CC0', duration: 30  },
  { id: 'brown-noise', name: 'Deep Brown Noise', icon: '🎧', category: 'Focus',    url: '/sounds/brown-noise.mp3', license: 'Royalty-Free / CC0', duration: 16  },
];

export const VIDEO_CATEGORIES: BackgroundCat[] = [
  'Cafes',
  'Cozy Rooms',
  'Nature & Rain',
  'City & Travel',
];

export const STATIC_CATEGORIES: BackgroundCat[] = [
  'Minimal',
  'Nature',
  'Aesthetic',
  'Dark Mode',
  'Abstract',
];

export const ALL_CATEGORIES: BackgroundCat[] = [
  ...VIDEO_CATEGORIES,
  ...STATIC_CATEGORIES,
  'Custom',
];

export function sanitizeTitle(raw: string, fallback = 'Untitled Space'): string {
  const cleaned = raw.replace(/[<>]/g, '').trim().slice(0, 80);
  return cleaned || fallback;
}

export function extractYouTubeId(input: string): string | null {
  const trimmed = (input || '').trim();
  if (!trimmed) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtu.be') {
      const id = parsed.pathname.split('/').filter(Boolean)[0] || '';
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      const vParam = parsed.searchParams.get('v');
      if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) return vParam;
      const parts = parsed.pathname.split('/').filter(Boolean);
      if ((parts[0] === 'embed' || parts[0] === 'live' || parts[0] === 'shorts' || parts[0] === 'v') && parts[1]) {
        return /^[a-zA-Z0-9_-]{11}$/.test(parts[1]) ? parts[1] : null;
      }
    }
  } catch {}
  return null;
}

export function isSafeMediaUrl(url: string): boolean {
  const trimmed = (url || '').trim();
  if (!trimmed) return false;
  if (extractYouTubeId(trimmed)) return true;
  if (trimmed.startsWith('/')) return !trimmed.startsWith('//');
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' || parsed.protocol === 'blob:';
  } catch {
    return trimmed.startsWith('data:image/') || trimmed.startsWith('data:video/');
  }
}

export function filterVideos(videos: VideoEntry[], query: string, category?: string): VideoEntry[] {
  const q = query.toLowerCase().trim();
  return videos.filter((v) => {
    if (v.status !== 'active') return false;
    const matchesCat =
      !category || category === 'All Spaces' || category === 'All'
        ? true
        : category === 'YouTube Live'
        ? v.contentType === 'youtube'
        : category === 'Instant MP4'
        ? v.contentType === 'direct_video'
        : category === 'Trending'
        ? v.isTrending
        : category === 'New Spaces'
        ? v.isNew
        : v.category === category;
    if (!matchesCat) return false;
    if (!q) return true;
    return (
      v.title.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q) ||
      v.tags.some((t) => t.toLowerCase().includes(q))
    );
  });
}

/**
 * Merges seeded catalog entries with stored entries:
 * - Upgrades any legacy `youtube` seed items that were replaced by local MP4s while keeping curated `yt-*` YouTube streams.
 * - Preserves viewCounts and user-added custom videos.
 */
export function mergeSeedWithStored(stored: VideoEntry[]): VideoEntry[] {
  const seedMap = new Map(SEED_VIDEOS.map((v) => [v.id, v]));
  const storedMap = new Map(stored.map((v) => [v.id, v]));

  const merged: VideoEntry[] = SEED_VIDEOS.map((seed) => {
    const prev = storedMap.get(seed.id);
    if (!prev) return seed;
    return {
      ...seed,
      viewCount: Math.max(seed.viewCount, prev.viewCount || 0),
    };
  });

  for (const item of stored) {
    if (!seedMap.has(item.id) && isSafeMediaUrl(item.contentUrl)) {
      merged.push(item);
    }
  }

  return merged;
}
