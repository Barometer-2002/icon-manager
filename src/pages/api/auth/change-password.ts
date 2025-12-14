import type { APIRoute } from 'astro';
import { getSessionUser, hashPassword, verifyPassword } from '../../../utils/auth';
import { getDB, saveDB } from '../../../utils/db';

export const POST: APIRoute = async (context) => {
  try {
    const sessionUser = await getSessionUser(context);
    if (!sessionUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await context.request.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return new Response(JSON.stringify({ error: '旧密码和新密码必填' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = await getDB();
    const user = db.users[sessionUser.username];

    if (!user || !verifyPassword(oldPassword, user)) {
      return new Response(JSON.stringify({ error: '旧密码不正确' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { salt, hash } = hashPassword(newPassword);
    user.salt = salt;
    user.passwordHash = hash;

    await saveDB(db);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};

