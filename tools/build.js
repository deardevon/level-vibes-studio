// Builds the library: copies each post's files into media/<id>/, makes a small preview for the
// grid, and writes catalog.json for the app. Run: node tools/build.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { execFileSync } = require('child_process');
const FFMPEG = require('ffmpeg-static');
const { build, MK } = require('./catalog');

const ROOT = path.join(__dirname, '..');
const isVideo = (f) => /\.mp4$/i.test(f);
const safe = (s) => s.replace(/[^\w.-]+/g, '-').replace(/-+/g, '-');

(async () => {
  const items = build();
  const missing = [];
  for (const it of items) {
    const dir = path.join(ROOT, 'media', it.id);
    fs.mkdirSync(dir, { recursive: true });
    it.media = [];
    let created = Infinity;
    for (const rel of it.files) {
      const src = MK + rel;
      if (!fs.existsSync(src)) { missing.push(rel); continue; }
      const st = fs.statSync(src);
      created = Math.min(created, st.birthtimeMs || st.mtimeMs);
      const name = safe(path.basename(rel));
      const dest = path.join(dir, name);
      // Copy when it's new, a different size, or the source was changed since (restyled files)
      if (!fs.existsSync(dest) || fs.statSync(dest).size !== st.size || fs.statSync(dest).mtimeMs < st.mtimeMs) fs.copyFileSync(src, dest);
      it.media.push({ src: `media/${it.id}/${name}`, kind: isVideo(rel) ? 'video' : 'image', name: path.basename(rel) });
    }
    delete it.files;
    // When it was made: the earliest of its files
    if (created < Infinity) it.created = new Date(created).toISOString();
    // Preview for the grid, from the first file
    const first = it.media[0];
    if (!first) continue;
    const thumb = path.join(ROOT, 'thumbs', `${it.id}.jpg`);
    fs.mkdirSync(path.dirname(thumb), { recursive: true });
    const firstPath = path.join(ROOT, first.src);
    // Make the preview again whenever the first file is newer than it
    if (!fs.existsSync(thumb) || fs.statSync(thumb).mtimeMs < fs.statSync(firstPath).mtimeMs) {
      if (first.kind === 'video') {
        const tmp = thumb + '.png';
        execFileSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', '-ss', '1.5', '-i', firstPath, '-frames:v', '1', tmp]);
        await sharp(tmp).resize({ width: 480 }).jpeg({ quality: 78 }).toFile(thumb);
        fs.unlinkSync(tmp);
      } else {
        await sharp(firstPath).resize({ width: 480 }).jpeg({ quality: 78 }).toFile(thumb);
      }
    }
    it.thumb = `thumbs/${it.id}.jpg`;
  }
  // A version stamp on every address, so phones fetch a file again when it changes instead of
  // showing the copy they saved earlier (the files keep the same names when posts are remade)
  const stamp = (rel) => `${rel}?v=${Math.round(fs.statSync(path.join(ROOT, rel)).mtimeMs).toString(36)}`;
  for (const it of items) {
    for (const m of it.media) m.url = stamp(m.src);
    if (it.thumb) it.thumbUrl = stamp(it.thumb);
  }
  // Remove files and previews no post uses any more (old versions, renamed or removed posts)
  const used = new Set(items.flatMap((i) => i.media.map((m) => m.src)));
  const ids = new Set(items.map((i) => i.id));
  let removed = 0;
  for (const d of fs.readdirSync(path.join(ROOT, 'media'))) {
    const dir = path.join(ROOT, 'media', d);
    for (const f of fs.readdirSync(dir)) if (!used.has(`media/${d}/${f}`)) { fs.unlinkSync(path.join(dir, f)); removed++; }
    if (!fs.readdirSync(dir).length) fs.rmdirSync(dir);
  }
  for (const f of fs.readdirSync(path.join(ROOT, 'thumbs'))) if (!ids.has(f.replace(/\.jpg$/, ''))) { fs.unlinkSync(path.join(ROOT, 'thumbs', f)); removed++; }
  if (removed) console.log(`removed ${removed} unused files`);
  // Newest first
  items.sort((a, b) => (b.created || '').localeCompare(a.created || ''));
  fs.writeFileSync(path.join(ROOT, 'catalog.json'), JSON.stringify({ updated: new Date().toISOString(), items }, null, 1));
  console.log(`${items.length} posts, ${items.reduce((a, i) => a + i.media.length, 0)} files`);
  if (missing.length) console.log('MISSING:\n' + missing.join('\n'));
})();
