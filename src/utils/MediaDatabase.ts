import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  SEED_SOUNDS,
  SEED_VIDEOS,
  extractYouTubeId,
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

const LOCAL_DATA_DIR = path.resolve(process.cwd(), 'data');
const LOCAL_DB_PATH = path.join(LOCAL_DATA_DIR, 'media-db.json');

const TMP_DATA_DIR = path.join(os.tmpdir(), 'studyaesthetic-data');
const TMP_DB_PATH = path.join(TMP_DATA_DIR, 'media-db.json');

let memoryDb: MediaDatabasePayload | null = null;
let writeChain: Promise<void> = Promise.resolve();

function createInitialPayload(): MediaDatabasePayload {
  return {
    version: 3,
    updatedAt: new Date().toISOString(),
    videos: SEED_VIDEOS.map((v) => ({ ...v })),
    sounds: SEED_SOUNDS.map((s) => ({ ...s })),
  };
}

async function readJsonIfExists(filePath: string): Promise<Partial<MediaDatabasePayload> | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as Partial<MediaDatabasePayload>;
  } catch {
    return null;
  }
}

async function ensureDatabaseFile(): Promise<MediaDatabasePayload> {
  try {
    const parsed =
      (await readJsonIfExists(TMP_DB_PATH)) ??
      (await readJsonIfExists(LOCAL_DB_PATH));

    if (!parsed) {
      if (!memoryDb) {
        memoryDb = createInitialPayload();
        await persistPayload(memoryDb);
      }
      return memoryDb;
    }

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
      version: 3,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      videos: mergedVideos,
      sounds: mergedSounds,
    };

    memoryDb = payload;

    if ((parsed.version ?? 0) < 3 || mergedVideos.length !== storedVideos.length) {
      await persistPayload(payload);
    }

    return payload;
  } catch {
    if (!memoryDb) {
      memoryDb = createInitialPayload();
    }
    return memoryDb;
  }
}

async function tryWriteDbFile(dirPath: string, filePath: string, serialized: string): Promise<boolean> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    const tmpPath = `${filePath}.${process.pid}.tmp`;
    await fs.writeFile(tmpPath, serialized, 'utf8');
    await fs.rename(tmpPath, filePath);
    return true;
  } catch {
    return false;
  }
}

async function persistPayload(payload: MediaDatabasePayload): Promise<void> {
  memoryDb = payload;
  const serialized = JSON.stringify(payload, null, 2);

  const next = writeChain.then(async () => {
    // Try writing to project data/ first (local dev), fallback to os.tmpdir() on read-only serverless (Vercel)
    const wroteLocal = await tryWriteDbFile(LOCAL_DATA_DIR, LOCAL_DB_PATH, serialized);
    if (!wroteLocal) {
      await tryWriteDbFile(TMP_DATA_DIR, TMP_DB_PATH, serialized);
    }
  }).catch(() => {});

  writeChain = next;
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
  contentType: 'direct_video' | 'image' | 'youtube';
  tags?: string[];
}): Promise<VideoEntry> {
  if (!isSafeMediaUrl(input.contentUrl)) {
    throw new Error('Invalid media URL');
  }
  const ytId = extractYouTubeId(input.contentUrl);
  const resolvedType = ytId ? 'youtube' : input.contentType;
  const resolvedUrl = ytId || input.contentUrl.trim();

  const db = await ensureDatabaseFile();
  const entry: VideoEntry = {
    id: `custom-${Date.now()}`,
    title: sanitizeTitle(input.title, ytId ? 'YouTube Study Stream' : 'Custom Space'),
    description: sanitizeTitle(input.description || 'Custom study background', 'Custom study background'),
    category: input.category || 'Custom',
    tags: Array.isArray(input.tags) && input.tags.length > 0 ? input.tags.slice(0, 8) : ['custom'],
    thumbnailUrl:
      input.thumbnailUrl && isSafeMediaUrl(input.thumbnailUrl)
        ? input.thumbnailUrl
        : resolvedType === 'youtube' && ytId
        ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
        : resolvedType === 'image'
        ? resolvedUrl
        : '/videos/thumbs/lofi-cafe.jpg',
    contentUrl: resolvedUrl,
    contentType: resolvedType,
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
