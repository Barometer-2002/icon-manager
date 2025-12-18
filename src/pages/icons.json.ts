
import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';

export const GET: APIRoute = async ({ request }) => {
  const iconDir = path.join(process.cwd(), 'public', 'icon');
  
  let icons: string[] = [];
  if (fs.existsSync(iconDir)) {
    icons = fs
      .readdirSync(iconDir)
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif'].includes(ext);
      })
      .sort();
  }

  const parsedIcons = icons.map((filename) => {
    const dotIndex = filename.lastIndexOf('.');
    const ext = dotIndex >= 0 ? filename.slice(dotIndex) : '';
    const nameWithoutExt = dotIndex >= 0 ? filename.slice(0, dotIndex) : filename;

    // Use the new separator '--'
    const parts = nameWithoutExt.split('--');
    const name = parts[0] || nameWithoutExt;
    const cnName = parts[1] || '';
    const domain = parts[2] || '';

    // Get the base URL from the request object, defaulting to relative path if needed
    // In static build, this JSON is just a file, so relative paths in 'url' are best
    return {
      name: name.replace(/_/g, ' '),
      cnName,
      domain,
      filename,
      // Serve icons via API that can read from ZIP or fallback to public/icon
      url: process.env.ICON_BASE_URL
        ? `${process.env.ICON_BASE_URL.replace(/\/+$/,'')}/${encodeURIComponent(filename)}`
        : `/api/icon/${encodeURIComponent(filename)}`,
      downloadUrl: process.env.ICON_BASE_URL
        ? `${process.env.ICON_BASE_URL.replace(/\/+$/,'')}/${encodeURIComponent(filename)}`
        : `/api/icon/${encodeURIComponent(filename)}`
    };
  });

  return new Response(JSON.stringify(parsedIcons), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*', // Allow CORS for external usage
    }
  });
}
