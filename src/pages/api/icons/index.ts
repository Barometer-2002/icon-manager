import type { APIRoute } from 'astro';
import { getIcons, getFiles } from '../../../utils/scanner';

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
  return new Response(JSON.stringify({ error: 'Upload is disabled in read-only mode (Edge Runtime)' }), { status: 405 });
};

    return new Response(JSON.stringify({ success: true, message: 'File uploaded' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'Upload failed' }), { status: 500 });
  }
};
