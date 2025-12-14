import type { APIRoute } from 'astro';
import { getSessionUser } from '../../../utils/auth';
import { getDB, saveDB } from '../../../utils/db';

export const GET: APIRoute = async (context) => {
  const sessionUser = await getSessionUser(context);
  if (!sessionUser || sessionUser.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const db = await getDB();
  const users = Object.values(db.users).map((u) => ({
    username: u.username,
    role: u.role,
    approved: u.approved,
    createdAt: u.createdAt,
  }));

  return new Response(JSON.stringify({ users }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async (context) => {
  const sessionUser = await getSessionUser(context);
  if (!sessionUser || sessionUser.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await context.request.json();
    const { username, approved, role } = body as {
      username?: string;
      approved?: boolean;
      role?: 'admin' | 'user';
    };

    if (!username) {
      return new Response(JSON.stringify({ error: '用户名必填' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = await getDB();
    const user = db.users[username];
    if (!user) {
      return new Response(JSON.stringify({ error: '用户不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (typeof approved === 'boolean') {
      user.approved = approved;
    }

    if (role && role !== user.role) {
      user.role = role;
    }

    await saveDB(db);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};

