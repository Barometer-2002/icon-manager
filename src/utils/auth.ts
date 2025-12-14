import type { APIContext } from 'astro';
import crypto from 'crypto';
import type { User, UserRole } from './db';
import { getDB, saveDB } from './db';

export const SESSION_COOKIE = 'icon-manager-session';

export interface SessionUser {
  username: string;
  role: UserRole;
  approved: boolean;
}

export function hashPassword(password: string, salt?: string) {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, s, 10000, 64, 'sha512').toString('hex');
  return { salt: s, hash };
}

export function verifyPassword(password: string, user: User) {
  const { hash } = hashPassword(password, user.salt);
  return hash === user.passwordHash;
}

export async function ensureAdminUser() {
  const db = await getDB();
  const hasAdmin = Object.values(db.users).some(u => u.role === 'admin');
  if (hasAdmin) return;
  const username = 'admin';
  const envPassword = import.meta.env.ADMIN_PASSWORD || 'admin';
  const { salt, hash } = hashPassword(envPassword);
  const admin: User = {
    username,
    passwordHash: hash,
    salt,
    role: 'admin',
    approved: true,
    createdAt: Date.now(),
  };
  db.users[username] = admin;
  await saveDB(db);
}

export async function getSessionUser(context: APIContext): Promise<SessionUser | null> {
  const cookie = context.cookies.get(SESSION_COOKIE);
  if (!cookie || !cookie.value) return null;
  const db = await getDB();
  const user = db.users[cookie.value];
  if (!user) return null;
  return {
    username: user.username,
    role: user.role,
    approved: user.approved,
  };
}

export async function isAuthenticated(context: APIContext): Promise<boolean> {
  const user = await getSessionUser(context);
  return !!user;
}
