import { CATEGORY_MAP } from '../consts';
import { getDB } from './db';
import fileList from '../generated/file-list.json';

interface CachedFile {
  relativePath: string;
  name: string;
  mtime: number;
}

export async function getFiles(forceRefresh = false) {
  // forceRefresh is ignored in static mode
  return fileList as CachedFile[];
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
      mtime: f.mtime,
      uploadedBy: meta.uploadedBy || undefined
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
