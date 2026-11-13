import type { APIRoute } from 'astro';
import { getSoundsFromDb } from '../../utils/MediaDatabase';

export const prerender = false;

export const GET: APIRoute = async () => {
  const sounds = await getSoundsFromDb();
  return new Response(JSON.stringify({ sounds }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
};
