
import fs from 'node:fs';
import path from 'node:path';

const ICONS_DIR = path.resolve(process.cwd(), 'public');
const OUTPUT_FILE = path.resolve(process.cwd(), 'src/generated/file-list.json');
const ALLOWED_EXTENSIONS = ['.svg', '.png', '.jpg', '.jpeg', '.webp', '.ico'];

function scanDirectory(dir, rootDir) {
  let results = [];
  try {
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const relativePath = path.relative(rootDir, filePath);
      
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

console.log('Scanning public directory...');
const files = scanDirectory(ICONS_DIR, ICONS_DIR);

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(files, null, 2));
console.log(`Generated file list with ${files.length} items at ${OUTPUT_FILE}`);

// Update db.json with new files
const DB_FILE = path.resolve(process.cwd(), 'db.json');
try {
  let db = { icons: {}, users: {} };
  if (fs.existsSync(DB_FILE)) {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  }
  
  let newCount = 0;
  files.forEach(file => {
    if (!db.icons[file.relativePath]) {
      const category = file.relativePath.split('/')[0] || 'icon';
      db.icons[file.relativePath] = {
        id: file.relativePath,
        tags: [],
        category: category,
        createdAt: Date.now(),
        uploadedBy: 'system' // Mark as auto-discovered
      };
      newCount++;
    }
  });

  if (newCount > 0) {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
    console.log(`Updated db.json with ${newCount} new items.`);
  } else {
    console.log('db.json is up to date.');
  }
} catch (e) {
  console.error('Error updating db.json:', e);
}
