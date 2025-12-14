import type { APIRoute } from 'astro';
import { searchIcons } from '../../utils/iconLoader';

export const GET: APIRoute = ({ url, request }) => {
  const keyword = url.searchParams.get('q') || '';
  
  const matches = searchIcons(keyword);
  
  // Format the response
  const results = matches.map(icon => ({
    name: icon,
    url: new URL(`/icon/${icon}`, request.url).toString(),
    path: `/icon/${icon}`
  }));

  return new Response(JSON.stringify({
    count: results.length,
    results: results
  }), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
