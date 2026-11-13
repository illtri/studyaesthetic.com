import fs from 'node:fs/promises';
import path from 'node:path';
import {
  SEED_SOUNDS,
  SEED_VIDEOS,
  isSafeMediaUrl,
  mergeSeedWithStored,
  sanitizeTitle,
  type BackgroundCat,
  type SoundEntry,
  type VideoEntry,
} from './mediaCatalog';

interface MediaDatabasePayload {
  version: number;
  updatedAt: string;
  videos: VideoEntry[];
  sounds: SoundEntry[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'media-db.json');

let writeChain: Promise<void> = Promise.resolve();

function createInitialPayload(): MediaDatabasePayload {
  return {
    version: 2,
    updatedAt: new Date().toISOString(),
    videos: SEED_VIDEOS,
    sounds: SEED_SOUNDS,
  };
}

async function ensureDatabaseFile(): Promise<MediaDatabasePayload> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<MediaDatabasePayload>;
    const storedVideos = Array.isArray(parsed.videos) ? parsed.videos : [];
    const mergedVideos = mergeSeedWithStored(storedVideos);

    const soundMap = new Map((Array.isArray(parsed.sounds) ? parsed.sounds : []).map((s) => [s.id, s]));
    const mergedSounds = SEED_SOUNDS.map((s) => soundMap.get(s.id) ?? s);
    if (Array.isArray(parsed.sounds)) {
      for (const s of parsed.sounds) {
        if (!mergedSounds.some((m) => m.id === s.id) && isSafeMediaUrl(s.url)) {
          mergedSounds.push(s);
        }
      }
    }

    const payload: MediaDatabasePayload = {
      version: 2,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      videos: mergedVideos,
      sounds: mergedSounds,
    };

    if ((parsed.version ?? 0) < 2 || mergedVideos.length !== storedVideos.length) {
      await persistPayload(payload);
    }

    return payload;
  } catch {
    const initial = createInitialPayload();
    await persistPayload(initial);
    return initial;
  }
}

async function persistPayload(payload: MediaDatabasePayload): Promise<void> {
  const next = writeChain.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmpPath = `${DB_PATH}.tmp`;
    await fs.writeFile(tmpPath, JSON.stringify(payload, null, 2), 'utf8');
    await fs.rename(tmpPath, DB_PATH);
  });
  writeChain = next.catch(() => {});
  return next;
}

export async function getVideosFromDb(): Promise<VideoEntry[]> {
  const db = await ensureDatabaseFile();
  return db.videos.filter((v) => v.status === 'active');
}

export async function getSpaceVideosFromDb(): Promise<VideoEntry[]> {
  const all = await getVideosFromDb();
  return all.filter((v) => v.contentType === 'direct_video' || v.contentType === 'youtube');
}

export async function getStaticBackgroundsFromDb(): Promise<VideoEntry[]> {
  const all = await getVideosFromDb();
  return all.filter((v) => v.contentType === 'image');
}

export async function getVideoByIdFromDb(id: string): Promise<VideoEntry | undefined> {
  const db = await ensureDatabaseFile();
  return db.videos.find((v) => v.id === id);
}

export async function addVideoToDb(input: {
  title: string;
  description?: string;
  category?: BackgroundCat;
  contentUrl: string;
  thumbnailUrl?: string;
  contentType: 'direct_video' | 'image';
  tags?: string[];
}): Promise<VideoEntry> {
  if (!isSafeMediaUrl(input.contentUrl)) {
    throw new Error('Invalid media URL');
  }
  const db = await ensureDatabaseFile();
  const entry: VideoEntry = {
    id: `custom-${Date.now()}`,
    title: sanitizeTitle(input.title, 'Custom Space'),
    description: sanitizeTitle(input.description || 'Custom study background', 'Custom study background'),
    category: input.category || 'Custom',
    tags: Array.isArray(input.tags) && input.tags.length > 0 ? input.tags.slice(0, 8) : ['custom'],
    thumbnailUrl:
      input.thumbnailUrl && isSafeMediaUrl(input.thumbnailUrl)
        ? input.thumbnailUrl
        : input.contentType === 'image'
        ? input.contentUrl
        : '/videos/thumbs/lofi-cafe.jpg',
    contentUrl: input.contentUrl.trim(),
    contentType: input.contentType,
    uploadDate: new Date().toISOString().split('T')[0],
    viewCount: 1,
    creatorInfo: 'User',
    status: 'active',
    isFeatured: false,
    isTrending: false,
    isNew: true,
    isCustom: true,
  };

  db.videos.unshift(entry);
  db.updatedAt = new Date().toISOString();
  await persistPayload(db);
  return entry;
}

export async function incrementViewInDb(id: string): Promise<VideoEntry | null> {
  const db = await ensureDatabaseFile();
  const target = db.videos.find((v) => v.id === id);
  if (!target) return null;
  target.viewCount = (target.viewCount || 0) + 1;
  db.updatedAt = new Date().toISOString();
  await persistPayload(db);
  return target;
}

export async function deleteCustomVideoFromDb(id: string): Promise<boolean> {
  const db = await ensureDatabaseFile();
  const target = db.videos.find((v) => v.id === id);
  if (!target || !target.isCustom) return false;
  db.videos = db.videos.filter((v) => v.id !== id);
  db.updatedAt = new Date().toISOString();
  await persistPayload(db);
  return true;
}

export async function getSoundsFromDb(): Promise<SoundEntry[]> {
  const db = await ensureDatabaseFile();
  return db.sounds;
}
