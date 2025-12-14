import type { APIRoute } from 'astro';
import { SESSION_COOKIE, ensureAdminUser, verifyPassword } from '../../../utils/auth';
import { getDB } from '../../../utils/db';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return new Response(JSON.stringify({ error: '用户名和密码必填' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await ensureAdminUser();
    const db = await getDB();
    const user = db.users[username];

    if (!user || !verifyPassword(password, user)) {
      return new Response(JSON.stringify({ error: '用户名或密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    cookies.set(SESSION_COOKIE, user.username, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          username: user.username,
          role: user.role,
          approved: user.approved,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
