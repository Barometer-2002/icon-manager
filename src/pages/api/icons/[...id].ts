import type { APIRoute } from 'astro';
import { updateIconMeta } from '../../../utils/db';
import { getSessionUser } from '../../../utils/auth';

export const DELETE: APIRoute = async (context) => {
  return new Response(JSON.stringify({ error: 'Delete is disabled in read-only mode (Edge Runtime)' }), { status: 405 });
};

export const PUT: APIRoute = async (context) => {
  const sessionUser = await getSessionUser(context);
  if (!sessionUser || sessionUser.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  const { request, params } = context;
  const id = params.id;
  if (!id) return new Response('ID required', { status: 400 });

  try {
    const body = await request.json();
    const { tags } = body;

    await updateIconMeta(id, { tags });
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to update' }), { status: 500 });
  }
};
