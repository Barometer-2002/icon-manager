import fs from 'fs/promises';
import { existsSync } from 'fs';
import { DB_FILE } from '../consts';

export interface IconMeta {
  id: string; // usually filename
  tags: string[];
  category?: string;
  createdAt: number;
}

export interface DBData {
  icons: Record<string, IconMeta>;
}

const defaultData: DBData = { icons: {} };

export async function getDB(): Promise<DBData> {
  if (!existsSync(DB_FILE)) {
    await fs.writeFile(DB_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  const content = await fs.readFile(DB_FILE, 'utf-8');
  try {
    return JSON.parse(content);
  } catch (e) {
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
  db.icons[id] = { ...db.icons[id], ...meta, id }; // ensure id is set
  await saveDB(db);
  return db.icons[id];
}
