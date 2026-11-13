import type { APIRoute } from 'astro';
import {
  addVideoToDb,
  deleteCustomVideoFromDb,
  getVideosFromDb,
  incrementViewInDb,
} from '../../utils/MediaDatabase';
import type { BackgroundCat } from '../../utils/mediaCatalog';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const videos = await getVideosFromDb();
  const type = url.searchParams.get('type');
  const filtered = type ? videos.filter((v) => v.contentType === type) : videos;
  return new Response(JSON.stringify({ videos: filtered }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();

    if (body && body.action === 'view' && typeof body.id === 'string') {
      const updated = await incrementViewInDb(body.id);
      if (!updated) {
        return new Response(JSON.stringify({ error: 'Video not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ video: updated }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const title = typeof body?.title === 'string' ? body.title : '';
    const contentUrl = typeof body?.contentUrl === 'string' ? body.contentUrl : '';
    const contentType =
      body?.contentType === 'image'
        ? 'image'
        : body?.contentType === 'youtube'
        ? 'youtube'
        : 'direct_video';
    const thumbnailUrl = typeof body?.thumbnailUrl === 'string' ? body.thumbnailUrl : undefined;
    const category = (typeof body?.category === 'string' ? body.category : 'Custom') as BackgroundCat;
    const description = typeof body?.description === 'string' ? body.description : undefined;

    if (!title.trim() || !contentUrl.trim()) {
      return new Response(JSON.stringify({ error: 'title and contentUrl are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const created = await addVideoToDb({
      title,
      description,
      category,
      contentUrl,
      thumbnailUrl,
      contentType,
    });

    return new Response(JSON.stringify({ video: created }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Invalid request';
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ url }) => {
  const id = url.searchParams.get('id');
  if (!id) {
    return new Response(JSON.stringify({ error: 'id is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const deleted = await deleteCustomVideoFromDb(id);
  return new Response(JSON.stringify({ deleted }), {
    status: deleted ? 200 : 404,
    headers: { 'Content-Type': 'application/json' },
  });
};
