import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../../utils/auth';

export const GET: APIRoute = async (context) => {
  const loggedIn = isAuthenticated(context);
  return new Response(JSON.stringify({ loggedIn }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
