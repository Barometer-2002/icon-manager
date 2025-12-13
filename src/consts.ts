import path from 'path';
import fs from 'fs';

// Icons directory is the parent directory of the current project
// D:\icons\icon-manager -> D:\icons
export const ICONS_DIR = path.resolve(process.cwd(), '..');
export const DB_FILE = path.resolve(process.cwd(), 'db.json');

export const CATEGORY_MAP: Record<string, string> = {
  'icon': 'public/icon',
  'all': 'public/icon',
  'pc': 'public/pc',
  'app': 'public/app',
  'mobile': 'public/app',
  'card': 'public/card'
};

export const ALLOWED_EXTENSIONS = ['.svg', '.png', '.jpg', '.jpeg', '.webp', '.ico'];
