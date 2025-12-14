import dbData from '../../db.json';

export interface IconMeta {
  id: string;
  tags: string[];
  category?: string;
  createdAt: number;
  uploadedBy?: string;
}

export type UserRole = 'admin' | 'user';

export interface User {
  username: string;
  passwordHash: string;
  salt: string;
  role: UserRole;
  approved: boolean;
  createdAt: number;
}

export interface DBData {
  icons: Record<string, IconMeta>;
  users: Record<string, User>;
}

// In read-only mode, we use the imported JSON directly
// Note: updates will not persist across re-deployments
let memoryDB: DBData = {
  icons: (dbData.icons || {}) as Record<string, IconMeta>,
  users: (dbData.users || {}) as Record<string, User>
};

export async function getDB(): Promise<DBData> {
  return memoryDB;
}

export async function saveDB(data: DBData) {
  // In read-only mode, we just update memory
  // This will reset on server restart (cold start)
  memoryDB = data;
  console.warn('DB update ignored in read-only mode');
}

export async function getIconMeta(id: string): Promise<IconMeta | undefined> {
  const db = await getDB();
  return db.icons[id];
}

export async function updateIconMeta(id: string, meta: Partial<IconMeta>) {
  const db = await getDB();
  db.icons[id] = { ...db.icons[id], ...meta, id };
  await saveDB(db);
  return db.icons[id];
}
