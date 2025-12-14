
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
