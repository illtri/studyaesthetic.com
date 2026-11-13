export type SpotifyMediaKind = 'playlist' | 'track' | 'album' | 'preview';

export interface SpotifyItem {
  id: string;
  spotifyId: string;
  kind: SpotifyMediaKind;
  title: string;
  subtitle: string;
  thumbnailUrl: string;
  previewAudioUrl?: string;
  externalUrl?: string;
  isCustom?: boolean;
}

export const SEED_SPOTIFY_ITEMS: SpotifyItem[] = [
  // ── Curated Study Playlists ──────────────────────────────────────────
  {
    id: 'sp-playlist-lofi-girl',
    spotifyId: '0vvXsWCC9xrXsKd4FyS8kM',
    kind: 'playlist',
    title: 'Lofi Girl — beats to relax/study to',
    subtitle: 'Lofi Girl · Study Playlist',
    thumbnailUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da848bc80c95b9d248cf462c0bd1',
  },
  {
    id: 'sp-playlist-deep-focus',
    spotifyId: '37i9dQZF1DWZeKCadgRdKQ',
    kind: 'playlist',
    title: 'Deep Focus',
    subtitle: 'Spotify · Ambient & Post-Rock',
    thumbnailUrl: 'https://i.scdn.co/image/ab67706f000000026020f2f6476db518ef747da4',
  },
  {
    id: 'sp-playlist-peaceful-piano',
    spotifyId: '37i9dQZF1DX4sWSpwq3LiO',
    kind: 'playlist',
    title: 'Peaceful Piano',
    subtitle: 'Spotify · Calm Piano Pieces',
    thumbnailUrl: 'https://i.scdn.co/image/ab67706f0000000270e1fb7db7b45809d6a80377',
  },
  {
    id: 'sp-playlist-chill-lofi',
    spotifyId: '37i9dQZF1DX8Uebhn9wzrS',
    kind: 'playlist',
    title: 'Chill Lofi Study Beats',
    subtitle: 'Spotify · Laid-back Study Beats',
    thumbnailUrl: 'https://i.scdn.co/image/ab67706f000000021498ddc160581579f9b55979',
  },
  {
    id: 'sp-playlist-jazz-vibes',
    spotifyId: '37i9dQZF1DX0SM0LYsmbMT',
    kind: 'playlist',
    title: 'Jazz Vibes',
    subtitle: 'Spotify · Instrumental Chill Jazz',
    thumbnailUrl: 'https://i.scdn.co/image/ab67706f00000002b1275110babf9cdaaea44cef',
  },
  {
    id: 'sp-playlist-instrumental-study',
    spotifyId: '37i9dQZF1DX9sIqqvKsjG8',
    kind: 'playlist',
    title: 'Instrumental Study',
    subtitle: 'Spotify · Soft Musical Backdrop',
    thumbnailUrl: 'https://i.scdn.co/image/ab67706f000000026cb530ab9aafafdaab62f4bb',
  },

  // ── Curated Popular & Chill Spotify Songs ───────────────────────────
  {
    id: 'sp-track-blue',
    spotifyId: '3be9ACTxtcL6Zm4vJRUiPG',
    kind: 'track',
    title: 'blue',
    subtitle: 'yung kai',
    thumbnailUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02e3c060bdd41fed06a866c494',
  },
  {
    id: 'sp-track-birds-of-a-feather',
    spotifyId: '6dOtVTDdiauQNBQEDOtlAB',
    kind: 'track',
    title: 'BIRDS OF A FEATHER',
    subtitle: 'Billie Eilish',
    thumbnailUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0271d62ea7ea8a5be92d3c1f62',
  },
  {
    id: 'sp-track-die-with-a-smile',
    spotifyId: '2plbrEY59IikOBgBGLjaoe',
    kind: 'track',
    title: 'Die With A Smile',
    subtitle: 'Lady Gaga & Bruno Mars',
    thumbnailUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0282ea2e9e1858aa012c57cd45',
  },
  {
    id: 'sp-track-super-shy',
    spotifyId: '5sdQOyqq2IDhvmx2lHOpwd',
    kind: 'track',
    title: 'Super Shy',
    subtitle: 'NewJeans',
    thumbnailUrl: 'https://image-cdn-fa.spotifycdn.com/image/ab67616d00001e023d98a0ae7c78a3a9babaf8af',
  },
  {
    id: 'sp-track-lover',
    spotifyId: '1dGr1c8CrMLDpV6mPbImSI',
    kind: 'track',
    title: 'Lover',
    subtitle: 'Taylor Swift',
    thumbnailUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02e787cffec20aa2a396a61647',
  },
  {
    id: 'sp-track-cruel-summer',
    spotifyId: '1BxfuPKGuaTgP7aM0Bbdwr',
    kind: 'track',
    title: 'Cruel Summer',
    subtitle: 'Taylor Swift',
    thumbnailUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02e787cffec20aa2a396a61647',
  },
  {
    id: 'sp-track-blinding-lights',
    spotifyId: '0VjIjW4GlUZAMYd2vXMi3b',
    kind: 'track',
    title: 'Blinding Lights',
    subtitle: 'The Weeknd',
    thumbnailUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e028863bc11d2aa12b54f5aeb36',
  },
  {
    id: 'sp-track-stay',
    spotifyId: '5HCyWlXZPP0y6Gqq8TgA20',
    kind: 'track',
    title: 'STAY',
    subtitle: 'The Kid LAROI & Justin Bieber',
    thumbnailUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02aed1660585c1e3c9ffb50b6a',
  },
  {
    id: 'sp-track-flowers',
    spotifyId: '0yLdNVWF3Srea0uzk55zFn',
    kind: 'track',
    title: 'Flowers',
    subtitle: 'Miley Cyrus',
    thumbnailUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02f429549123dbe8552764ba1d',
  },
  {
    id: 'sp-track-watermelon-sugar',
    spotifyId: '6UelLqGlWMcVH1E5c4H7lY',
    kind: 'track',
    title: 'Watermelon Sugar',
    subtitle: 'Harry Styles',
    thumbnailUrl: 'https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e0225180571abce9472f61bd722',
  },
];

/**
 * Parses a Spotify URL or URI into `{ kind, spotifyId }`.
 * Supports:
 * - https://open.spotify.com/track/3be9ACTxtcL6Zm4vJRUiPG?si=...
 * - https://open.spotify.com/intl-en/track/3be9ACTxtcL6Zm4vJRUiPG
 * - https://open.spotify.com/playlist/0vvXsWCC9xrXsKd4FyS8kM
 * - https://open.spotify.com/album/1NAmidJlEaVgA3MpcPFYGq
 * - spotify:track:3be9ACTxtcL6Zm4vJRUiPG
 */
export function parseSpotifyInput(
  raw: string
): { kind: 'track' | 'playlist' | 'album'; spotifyId: string } | null {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();

  // URI format: spotify:track:ID
  const uriMatch = trimmed.match(/^spotify:(track|playlist|album):([a-zA-Z0-9]{15,30})$/);
  if (uriMatch) {
    return {
      kind: uriMatch[1] as 'track' | 'playlist' | 'album',
      spotifyId: uriMatch[2],
    };
  }

  try {
    const parsed = new URL(trimmed);
    if (!parsed.hostname.endsWith('spotify.com')) return null;
    // Matches /track/ID, /playlist/ID, /album/ID, /embed/track/ID, /intl-xx/track/ID
    const pathMatch = parsed.pathname.match(
      /\/(?:embed\/|intl-[a-zA-Z-]+\/)?(track|playlist|album)\/([a-zA-Z0-9]{15,30})/
    );
    if (pathMatch) {
      return {
        kind: pathMatch[1] as 'track' | 'playlist' | 'album',
        spotifyId: pathMatch[2],
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function buildSpotifyEmbedUrl(kind: 'track' | 'playlist' | 'album', spotifyId: string): string {
  return `https://open.spotify.com/embed/${kind}/${spotifyId}?utm_source=generator&theme=0`;
}
