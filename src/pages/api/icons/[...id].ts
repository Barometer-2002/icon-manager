import type { APIRoute } from 'astro';
import path from 'path';
import fs from 'fs/promises';
import { ICONS_DIR } from '../../../consts';
import { updateIconMeta } from '../../../utils/db';
import { getFiles } from '../../../utils/scanner';

import { isAuthenticated } from '../../../utils/auth';

export const DELETE: APIRoute = async (context) => {
  if (!isAuthenticated(context)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
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
    await getFiles(true); // Refresh cache
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to delete' }), { status: 500 });
  }
};

export const PUT: APIRoute = async (context) => {
  if (!isAuthenticated(context)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const { request, params } = context;
  const id = params.id;
  if (!id) return new Response('ID required', { status: 400 });

  try {
    const body = await request.json();
    const { tags } = body;

    // We only update metadata in DB, we don't rename file for now
    await updateIconMeta(id, { tags });
    
    // We might want to trigger a cache refresh if we stored tags in cache, 
    // but our getIcons function reads DB on every request for tags, so it's fine.
    // However, searching relies on filtering. The scanner currently reads DB.
    // So we should strictly speaking refresh or just rely on next request reading DB.
    // The scanner.ts:getIcons reads DB fresh every time for tags mapping, so it's fine.

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to update' }), { status: 500 });
  }
};
