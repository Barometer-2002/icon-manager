import type { APIRoute } from 'astro';
import { getIcons } from '../../utils/iconLoader';

export const GET: APIRoute = async () => {
  const icons = getIcons();
  
  // Return all icons. Filtering must be done client-side for static builds.
  const results = icons.map(icon => ({
    name: icon,
    url: `/icon/${icon}`,
    path: `/icon/${icon}`
  }));

  return new Response(JSON.stringify({
    count: results.length,
    results: results,
    note: "Static build: Client-side filtering required."
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

// Required for SSG
export function getStaticPaths() {
  return [
    { params: { path: undefined } } 
  ];
}
