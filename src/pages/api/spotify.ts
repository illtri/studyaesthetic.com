import type { APIRoute } from 'astro';
import {
  SEED_SPOTIFY_ITEMS,
  parseSpotifyInput,
  type SpotifyItem,
} from '../../utils/spotifyCatalog';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const q = (url.searchParams.get('q') || '').trim();
  if (!q) {
    return new Response(JSON.stringify({ items: SEED_SPOTIFY_ITEMS }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  }

  // If the user pasted a Spotify URL into the search box, resolve via oEmbed
  const parsed = parseSpotifyInput(q);
  if (parsed) {
    const resolved = await resolveSpotifyOembed(parsed.kind, parsed.spotifyId);
    return new Response(JSON.stringify({ items: [resolved] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const lower = q.toLowerCase();
  const matchedSeed = SEED_SPOTIFY_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(lower) ||
      item.subtitle.toLowerCase().includes(lower)
  );

  const previewResults: SpotifyItem[] = [];
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=6`
    );
    if (res.ok) {
      const data = await res.json();
      const results = Array.isArray(data?.results) ? data.results : [];
      for (const track of results) {
        if (!track?.trackName || !track?.previewUrl) continue;
        // Skip if we already have an exact Spotify track match in matchedSeed
        const dup = matchedSeed.some(
          (m) =>
            m.title.toLowerCase() === String(track.trackName).toLowerCase() &&
            m.subtitle.toLowerCase().includes(String(track.artistName || '').toLowerCase())
        );
        if (dup) continue;

        previewResults.push({
          id: `preview-${track.trackId || Date.now()}`,
          spotifyId: String(track.trackId || ''),
          kind: 'preview',
          title: String(track.trackName),
          subtitle: String(track.artistName || 'Artist'),
          thumbnailUrl: String(track.artworkUrl100 || '').replace('100x100bb', '300x300bb'),
          previewAudioUrl: String(track.previewUrl),
          externalUrl: `https://open.spotify.com/search/${encodeURIComponent(
            `${track.trackName} ${track.artistName || ''}`
          )}`,
          isCustom: true,
        });
      }
    }
  } catch {
    // Fallback to matchedSeed if external search fails
  }

  return new Response(
    JSON.stringify({ items: [...matchedSeed, ...previewResults] }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const rawUrl = typeof body?.url === 'string' ? body.url.trim() : '';
    const customTitle = typeof body?.title === 'string' ? body.title.trim() : '';

    const parsed = parseSpotifyInput(rawUrl);
    if (!parsed) {
      return new Response(
        JSON.stringify({
          error: 'Please enter a valid Spotify Track, Playlist, or Album link.',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const item = await resolveSpotifyOembed(parsed.kind, parsed.spotifyId, customTitle);
    return new Response(JSON.stringify({ item }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(
      JSON.stringify({ error: 'Unable to add Spotify link.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

async function resolveSpotifyOembed(
  kind: 'track' | 'playlist' | 'album',
  spotifyId: string,
  customTitle?: string
): Promise<SpotifyItem> {
  const canonicalUrl = `https://open.spotify.com/${kind}/${spotifyId}`;
  let title = customTitle || `Spotify ${kind.charAt(0).toUpperCase() + kind.slice(1)}`;
  let thumbnailUrl = 'https://i.scdn.co/image/ab67706c0000da84ca717228b1f23c1b0a170c2f';

  try {
    const res = await fetch(
      `https://open.spotify.com/oembed?url=${encodeURIComponent(canonicalUrl)}`
    );
    if (res.ok) {
      const data = await res.json();
      if (!customTitle && typeof data?.title === 'string' && data.title.trim()) {
        title = data.title.trim();
      }
      if (typeof data?.thumbnail_url === 'string' && data.thumbnail_url.trim()) {
        thumbnailUrl = data.thumbnail_url.trim();
      }
    }
  } catch {
    // Use fallback title & thumbnail
  }

  return {
    id: `sp-custom-${kind}-${spotifyId}`,
    spotifyId,
    kind,
    title,
    subtitle: `Spotify ${kind.charAt(0).toUpperCase() + kind.slice(1)}`,
    thumbnailUrl,
    isCustom: true,
  };
}
