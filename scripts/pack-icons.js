import fs from 'node:fs';
import path from 'node:path';
import AdmZip from 'adm-zip';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const iconDir = path.join(publicDir, 'icon');
const outZip = path.join(publicDir, 'icons.zip');

if (!fs.existsSync(iconDir)) {
  console.error('No public/icon directory found — nothing to pack.');
  process.exit(1);
}

console.log('Packing icons from', iconDir, '->', outZip);

const zip = new AdmZip();

const addDir = (dir, base) => {
  const items = fs.readdirSync(dir);
  for (const it of items) {
    const full = path.join(dir, it);
    const rel = path.posix.join(base, it);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      addDir(full, rel);
    } else if (stat.isFile()) {
      zip.addLocalFile(full, path.posix.dirname(rel));
    }
  }
};

addDir(iconDir, 'icon');

zip.writeZip(outZip);
console.log('Wrote', outZip);

// remove directory after zip created
const rimraf = (p) => {
  if (!fs.existsSync(p)) return;
  for (const entry of fs.readdirSync(p)) {
    const cur = path.join(p, entry);
    const st = fs.statSync(cur);
    if (st.isDirectory()) rimraf(cur);
    else fs.unlinkSync(cur);
  }
  fs.rmdirSync(p);
};

rimraf(iconDir);
console.log('Removed', iconDir);

console.log('Done. You can now build — icons are packed into public/icons.zip.');
