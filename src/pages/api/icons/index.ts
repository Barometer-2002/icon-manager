import type { APIRoute } from 'astro';
import { getIcons, getFiles } from '../../../utils/scanner';
import { ICONS_DIR, ALLOWED_EXTENSIONS, CATEGORY_MAP } from '../../../consts';
import path from 'node:path';
import fs from 'node:fs/promises';

import { getSessionUser } from '../../../utils/auth';
import { updateIconMeta } from '../../../utils/db';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const search = url.searchParams.get('search') || '';
  const category = url.searchParams.get('category') || '';
  const refresh = url.searchParams.get('refresh') === 'true';

  if (refresh) {
    await getFiles(true);
  }

  const result = await getIcons(page, limit, search, category);

  return new Response(JSON.stringify(result), {
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
};

export const POST: APIRoute = async (context) => {
  try {
    const sessionUser = await getSessionUser(context);
    if (!sessionUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    if (!sessionUser.approved) {
      return new Response(JSON.stringify({ error: '未获管理员授权，不能上传' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { request } = context;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = (formData.get('category') as string) || 'icon';
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return new Response(JSON.stringify({ error: 'Invalid file type' }), { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    
    // Determine target directory
    const relativeDir = CATEGORY_MAP[category] || CATEGORY_MAP['icon'];
    const targetDir = path.join(ICONS_DIR, relativeDir);
    
    // Ensure directory exists
    try {
        await fs.mkdir(targetDir, { recursive: true });
    } catch (e) {
        // ignore if exists
    }

    const filePath = path.join(targetDir, file.name);

    const finalPath = filePath;

    await fs.writeFile(finalPath, Buffer.from(buffer));

    const relativePath = path.relative(ICONS_DIR, finalPath).replace(/\\/g, '/');

    await updateIconMeta(relativePath, {
      tags: [],
      category,
      createdAt: Date.now(),
      uploadedBy: sessionUser.username,
    });

    await getFiles(true);

    return new Response(JSON.stringify({ success: true, message: 'File uploaded' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500 });
  }
};
