import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import { ICONS_DIR } from '../../../consts';

export const GET: APIRoute = async ({ params, request }) => {
  const filePathParam = params.path;
  if (!filePathParam) {
    return new Response('Not Found', { status: 404 });
  }

  // Prevent directory traversal
  const safePath = path.normalize(filePathParam).replace(/^(\.\.[\/\\])+/, '');
  const absolutePath = path.join(ICONS_DIR, safePath);

  // Ensure the file is within ICONS_DIR
  if (!absolutePath.startsWith(ICONS_DIR)) {
    return new Response('Forbidden', { status: 403 });
  }

  if (!fs.existsSync(absolutePath)) {
    return new Response('Not Found', { status: 404 });
  }

  const stat = fs.statSync(absolutePath);
  if (!stat.isFile()) {
     return new Response('Not a file', { status: 400 });
  }

  // Determine content type
  const ext = path.extname(absolutePath).toLowerCase();
  let contentType = 'application/octet-stream';
  if (ext === '.svg') contentType = 'image/svg+xml';
  else if (ext === '.png') contentType = 'image/png';
  else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  else if (ext === '.webp') contentType = 'image/webp';
  else if (ext === '.ico') contentType = 'image/x-icon';

  const fileStream = fs.createReadStream(absolutePath);
  
  // @ts-ignore: Astro types might complain about ReadableStream/Node stream compatibility
  return new Response(fileStream, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  });
};
