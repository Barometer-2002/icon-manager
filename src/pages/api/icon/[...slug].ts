import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import AdmZip from 'adm-zip';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const iconDir = path.join(publicDir, 'icon');
const zipPath = path.join(publicDir, 'icons.zip');

let zipCache: AdmZip | null = null;

const mimeFor = (name: string) => {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'png': return 'image/png';
    case 'jpg': case 'jpeg': return 'image/jpeg';
    case 'svg': return 'image/svg+xml';
    case 'webp': return 'image/webp';
    case 'gif': return 'image/gif';
    default: return 'application/octet-stream';
  }
};

export const GET: APIRoute = async ({ params }) => {
  const slug = (params.slug as string[]) || [];
  const filename = decodeURIComponent(slug.join('/'));
  if (!filename) return new Response('Not found', { status: 404 });

  // First try filesystem (useful for dev and when icons dir exists)
  const fsPath = path.join(iconDir, filename);
  if (fs.existsSync(fsPath)) {
    const stat = fs.statSync(fsPath);
    const stream = fs.createReadStream(fsPath);
    return new Response(stream, {
      status: 200,
      headers: { 'Content-Type': mimeFor(filename), 'Content-Length': String(stat.size) }
    });
  }

  // Fallback to zip
  if (!fs.existsSync(zipPath)) {
    return new Response('Not found', { status: 404 });
  }

  if (!zipCache) {
    zipCache = new AdmZip(zipPath);
  }

  const entry = zipCache.getEntry(path.posix.join('icon', filename));
  if (!entry) return new Response('Not found', { status: 404 });

  const buf = entry.getData();
  return new Response(buf, {
    status: 200,
    headers: { 'Content-Type': mimeFor(filename), 'Content-Length': String(buf.length) }
  });
};
