import type { APIRoute } from 'astro';
import { ensureAdminUser, hashPassword } from '../../../utils/auth';
import { getDB, saveDB } from '../../../utils/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return new Response(JSON.stringify({ error: '用户名和密码必填' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const trimmedName = String(username).trim();
    if (!trimmedName) {
      return new Response(JSON.stringify({ error: '用户名不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await ensureAdminUser();
    const db = await getDB();

    if (db.users[trimmedName]) {
      return new Response(JSON.stringify({ error: '用户名已存在' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { salt, hash } = hashPassword(password);

    db.users[trimmedName] = {
      username: trimmedName,
      passwordHash: hash,
      salt,
      role: 'user',
      approved: false,
      createdAt: Date.now(),
    };

    await saveDB(db);

    return new Response(
      JSON.stringify({
        success: true,
        pendingApproval: true,
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

