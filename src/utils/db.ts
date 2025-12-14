import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { DB_FILE } from '../consts';

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

const defaultData: DBData = { icons: {}, users: {} };

export async function getDB(): Promise<DBData> {
  if (!existsSync(DB_FILE)) {
    await fs.writeFile(DB_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  const content = await fs.readFile(DB_FILE, 'utf-8');
  try {
    const parsed = JSON.parse(content) as Partial<DBData>;
    return {
      icons: parsed.icons || {},
      users: parsed.users || {},
    };
  } catch {
    return defaultData;
  }
}

export async function saveDB(data: DBData) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
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
