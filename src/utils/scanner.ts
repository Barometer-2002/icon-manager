import fs from 'fs';
import path from 'path';
import { ICONS_DIR, ALLOWED_EXTENSIONS, CATEGORY_MAP } from '../consts';
import { getDB } from './db';

interface CachedFile {
  relativePath: string;
  name: string;
  mtime: number;
}

let fileCache: CachedFile[] | null = null;
let lastScanTime = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute cache

function scanDirectory(dir: string, rootDir: string): CachedFile[] {
  let results: CachedFile[] = [];
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const relativePath = path.relative(rootDir, filePath);
      
      // Ignore hidden files and the project directory itself
      if (file.startsWith('.') || file === 'icon-manager' || file === 'node_modules' || file === '.git') {
        continue;
      }

      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(scanDirectory(filePath, rootDir));
      } else {
        const ext = path.extname(file).toLowerCase();
        if (ALLOWED_EXTENSIONS.includes(ext)) {
          results.push({
            relativePath: relativePath.replace(/\\/g, '/'),
            name: file,
            mtime: stat.mtimeMs
          });
        }
      }
    }
  } catch (e) {
    console.error(`Error scanning directory ${dir}:`, e);
  }
  return results;
}

export async function getFiles(forceRefresh = false) {
  const now = Date.now();
  if (!fileCache || forceRefresh || (now - lastScanTime > CACHE_DURATION)) {
    console.log('Scanning files...');
    fileCache = scanDirectory(ICONS_DIR, ICONS_DIR);
    lastScanTime = now;
  }
  return fileCache;
}

export async function getIcons(page = 1, limit = 50, search = '', category = '') {
  const files = await getFiles();
  const db = await getDB();

  let filtered = files;

  // Filter by category (directory)
  if (category) {
    // Map simplified category names to actual directory paths
    const dirPrefix = CATEGORY_MAP[category] || CATEGORY_MAP['icon']; // default to icon if unknown, or maybe strict?
    
    // If category is not in map, maybe we should treat it as 'all' or ignore? 
    // But for now let's assume valid category input or fallback to icon logic if it matches user intent.
    // Actually, let's just use the map. If undefined, maybe don't filter? 
    // But user wants "button corresponds to directory".
    if (dirPrefix) {
        filtered = filtered.filter(f => {
            return f.relativePath.startsWith(`${dirPrefix}/`);
        });
    }
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(f => {
      const meta = db.icons[f.relativePath];
      const tags = meta?.tags?.join(' ').toLowerCase() || '';
      return f.name.toLowerCase().includes(searchLower) || tags.includes(searchLower);
    });
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const sliced = filtered.slice(start, end);

  const data = sliced.map(f => {
    const meta = db.icons[f.relativePath] || {};
    return {
      id: f.relativePath,
      name: f.name,
      path: f.relativePath,
      url: `/api/image/${f.relativePath}`,
      tags: meta.tags || [],
      mtime: f.mtime
    };
  });

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
}
