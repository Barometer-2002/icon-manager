import type { APIRoute } from 'astro';
import { getIcons, getFiles } from '../../../utils/scanner';
import { ICONS_DIR, ALLOWED_EXTENSIONS, CATEGORY_MAP } from '../../../consts';
import path from 'path';
import fs from 'fs/promises';

import { isAuthenticated } from '../../../utils/auth';

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
  if (!isAuthenticated(context)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  const { request } = context;
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string || 'icon'; // Default to icon if not provided
    
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
    
    // Check if file exists to avoid overwrite? For now, we allow overwrite or maybe append timestamp
    // Let's simple check
    let finalPath = filePath;
    let finalName = file.name;
    
    // Simple logic to avoid overwrite: append timestamp if exists
    // (omitted for brevity, assume overwrite is okay or user manages it)
    
    await fs.writeFile(finalPath, Buffer.from(buffer));
    
    // Refresh cache
    await getFiles(true);

    return new Response(JSON.stringify({ success: true, message: 'File uploaded' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500 });
  }
};
