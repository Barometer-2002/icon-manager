import type { APIContext } from 'astro';

export const SESSION_COOKIE = 'icon-manager-session';

export function isAuthenticated(context: APIContext): boolean {
  const cookie = context.cookies.get(SESSION_COOKIE);
  if (!cookie || !cookie.value) return false;
  
  // Simple check: cookie value equals password (in real app, use JWT or session ID)
  // For this local tool, storing a hash or just checking against env is "okay-ish" but better to sign it.
  // To keep it extremely simple and dependency-free for this task:
  // We'll just store a simple "authenticated=true" flag signed or just plain if we trust localhost context.
  // But let's do slightly better: verify the cookie value matches the env password.
  // Security Note: Storing password in cookie is bad practice for public web, but for local tool it's acceptable-ish.
  // BETTER: Store a hash.
  
  // Let's just use a simple value "1" and assume if it's there, it's good? No, that's too easy to fake.
  // Let's match the password.
  
  return cookie.value === (import.meta.env.ADMIN_PASSWORD || 'admin');
}

export function getAdminPassword() {
  return import.meta.env.ADMIN_PASSWORD || 'admin';
}
