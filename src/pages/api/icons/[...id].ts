import type { APIRoute } from 'astro';
import path from 'node:path';
import fs from 'node:fs/promises';
import { ICONS_DIR } from '../../../consts';
import { updateIconMeta } from '../../../utils/db';
import { getFiles } from '../../../utils/scanner';

import { getSessionUser } from '../../../utils/auth';

export const DELETE: APIRoute = async (context) => {
  const sessionUser = await getSessionUser(context);
  if (!sessionUser || sessionUser.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  const { params } = context;
  const id = params.id;
  if (!id) return new Response('ID required', { status: 400 });

  const safePath = path.normalize(id).replace(/^(\.\.[\/\\])+/, '');
  const absolutePath = path.join(ICONS_DIR, safePath);

  if (!absolutePath.startsWith(ICONS_DIR)) {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    await fs.unlink(absolutePath);
    await getFiles(true);
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to delete' }), { status: 500 });
  }
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
