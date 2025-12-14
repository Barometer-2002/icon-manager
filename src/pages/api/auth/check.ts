import type { APIRoute } from 'astro';
import { ensureAdminUser, getSessionUser } from '../../../utils/auth';

export const GET: APIRoute = async (context) => {
  await ensureAdminUser();
  const user = await getSessionUser(context);
  return new Response(
    JSON.stringify({
      loggedIn: !!user,
      user: user
        ? {
            username: user.username,
            role: user.role,
            approved: user.approved,
          }
        : null,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    },
  );
};
