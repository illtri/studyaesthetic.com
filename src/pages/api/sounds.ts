import type { APIRoute } from 'astro';
import { getSoundsFromDb } from '../../utils/MediaDatabase';
import { SEED_SOUNDS } from '../../utils/mediaCatalog';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const sounds = await getSoundsFromDb();
    return new Response(JSON.stringify({ sounds }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return new Response(JSON.stringify({ sounds: SEED_SOUNDS }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  }
};
