import fs from 'node:fs';
import path from 'node:path';

let iconCache: string[] | null = null;
const iconDir = path.join(process.cwd(), 'public', 'icon');

export function getIcons(): string[] {
  if (iconCache) return iconCache;

  try {
    if (fs.existsSync(iconDir)) {
      iconCache = fs.readdirSync(iconDir).filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif'].includes(ext);
      });
    } else {
      console.error(`Icon directory not found: ${iconDir}`);
      iconCache = [];
    }
  } catch (error) {
    console.error('Error reading icon directory:', error);
    iconCache = [];
  }

  return iconCache;
}

export function searchIcons(keyword: string): string[] {
  const icons = getIcons();
  if (!keyword) return icons;
  const lowerKeyword = keyword.toLowerCase();
  return icons.filter(icon => icon.toLowerCase().includes(lowerKeyword));
}
