import path from 'node:path';
import fs from 'node:fs';

export const ICONS_DIR = path.resolve(process.cwd(), 'public');
export const DB_FILE = path.resolve(process.cwd(), 'db.json');

export const CATEGORY_MAP: Record<string, string> = {
  icon: 'icon',
  all: 'icon',
  pc: 'pc',
  app: 'app',
  mobile: 'app',
  card: 'card'
};

export const ALLOWED_EXTENSIONS = ['.svg', '.png', '.jpg', '.jpeg', '.webp', '.ico'];
