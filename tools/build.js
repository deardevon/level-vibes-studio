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

// One post per thing you actually post. Carousels and story sets stay together (they're posted
// together). A feed version and a story version are two separate posts. An ad keeps its sizes
// together (Ads Manager uses them in one ad), but different creatives become separate ads.
const THUMB_AT = { 'reel-1-2-announcement': 11, 'reel-coming-soon': 10.5, 'reel-sneak-peek': 10.5 };
const STORY_NOTE = 'Story: no caption needed. Add a link sticker (levelvibes.app) if you like.';
const kindOf = (f) => (/\.mp4$/i.test(f) ? (/4x5/.test(f) ? 'feedvid' : 'reel') : /\/Story\/|story|9x16/i.test(f) ? 'story' : /square|1x1/i.test(f) ? 'square' : 'feed');
const LABEL = { feed: 'feed post', story: 'story', square: 'square post', reel: 'Reel', feedvid: 'feed version, 4:5' };
function split(items) {
  const out = [];
  for (const it of items) {
    if (it.files.length < 2 || it.type === 'carousel' || it.type === 'story') { out.push(it); continue; }
    if (it.type === 'ad') {
      // group by creative: the name without its size
      const groups = new Map();
      for (const f of it.files) {
        const key = path.basename(f).replace(/\s*\((feed 4x5|9x16)\)|\s*(4x5|1x1)(?=\.)/g, '').replace(/\.\w+$/, '');
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(f);
      }
      if (groups.size === 1) { out.push(it); continue; }
      [...groups.entries()].forEach(([key, files], k) => {
        const what = key.replace(/^Ad (video|image) (\w+) - /, (m, t, n) => `${t} ${n}: `);
        out.push({ ...it, id: `${it.id}-${k + 1}`, title: `${it.title.replace(/^Ad: /, 'Ad: ')} (${what.split(':')[0]})`, files });
      });
      continue;
    }
    const base = it.title.replace(/\s*\((before|after) 2\.0\)/, '');
    const when = (it.title.match(/\((before|after) 2\.0\)/) || [''])[0];
    it.files.forEach((f, k) => {
      const kind = kindOf(f);
      const stories = it.files.filter((x) => kindOf(x) === 'story').length;
      const nm = path.basename(f).replace(/^Story - |\.png$/g, '');
      const name = stories > 1 && kind === 'story' && !base.endsWith(nm) ? `story: ${nm}` : LABEL[kind];
      const story = kind === 'story';
      out.push({ ...it, id: `${it.id}-${k + 1}`, title: `${base} (${name})${when ? ' ' + when : ''}`, type: story ? 'story' : it.type, files: [f],
        ...(story ? { caption: STORY_NOTE, hashtags: [] } : {}) });
    });
  }
  return out;
}

(async () => {
  const items = split(build());
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
      // The version (when the source last changed) is part of the file name, so a remade post gets
      // a new address and phones can't keep showing a copy they saved earlier
      const v = Math.round(st.mtimeMs).toString(36);
      const ext = path.extname(rel);
      const name = `${safe(path.basename(rel, ext))}-${v}${ext}`;
      const dest = path.join(dir, name);
      if (!fs.existsSync(dest) || fs.statSync(dest).size !== st.size) fs.copyFileSync(src, dest);
      it.media.push({ src: `media/${it.id}/${name}`, kind: isVideo(rel) ? 'video' : 'image', name: path.basename(rel), v });
    }
    delete it.files;
    // When it was made: the earliest of its files
    if (created < Infinity) it.created = new Date(created).toISOString();
    // Preview for the grid, from the first file (named with that file's version too)
    const first = it.media[0];
    if (!first) continue;
    // where to take a video's preview frame (default 1.5 s; some reels start on a blank screen)
    const at = THUMB_AT[it.id] || 1.5;
    const thumbRel = `thumbs/${it.id}-${first.v}${at !== 1.5 ? `-t${at}` : ''}.jpg`;
    const thumb = path.join(ROOT, thumbRel);
    fs.mkdirSync(path.dirname(thumb), { recursive: true });
    if (!fs.existsSync(thumb)) {
      const firstPath = path.join(ROOT, first.src);
      if (first.kind === 'video') {
        const tmp = thumb + '.png';
        execFileSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(at), '-i', firstPath, '-frames:v', '1', tmp]);
        await sharp(tmp).resize({ width: 480 }).jpeg({ quality: 78 }).toFile(thumb);
        fs.unlinkSync(tmp);
      } else {
        await sharp(firstPath).resize({ width: 480 }).jpeg({ quality: 78 }).toFile(thumb);
      }
    }
    it.thumb = thumbRel;
    for (const m of it.media) delete m.v;
  }
  // Remove files and previews no post uses any more (old versions, renamed or removed posts)
  const used = new Set(items.flatMap((i) => [...i.media.map((m) => m.src), i.thumb]));
  let removed = 0;
  for (const d of fs.readdirSync(path.join(ROOT, 'media'))) {
    const dir = path.join(ROOT, 'media', d);
    for (const f of fs.readdirSync(dir)) if (!used.has(`media/${d}/${f}`)) { fs.unlinkSync(path.join(dir, f)); removed++; }
    if (!fs.readdirSync(dir).length) fs.rmdirSync(dir);
  }
  for (const f of fs.readdirSync(path.join(ROOT, 'thumbs'))) if (!used.has(`thumbs/${f}`)) { fs.unlinkSync(path.join(ROOT, 'thumbs', f)); removed++; }
  if (removed) console.log(`removed ${removed} unused files`);
  // Pinned at the top, in this order (the 2.0 rollout: coming soon, then the announcement); the rest newest first
  const TOP = ['car-coming-soon', 'reel-coming-soon', 'reel-sneak-peek', 'img-coming-soon', 'reel-1-2-announcement', 'car-level-vibes-1-2', 'img-1-2-announcement'];
  const rank = (i) => { const k = TOP.findIndex((t) => i.id === t || i.id.startsWith(t + '-')); return k < 0 ? TOP.length : k; };
  items.sort((a, b) => rank(a) - rank(b) || (rank(a) < TOP.length ? a.id.localeCompare(b.id) : (b.created || '').localeCompare(a.created || '')));
  fs.writeFileSync(path.join(ROOT, 'catalog.json'), JSON.stringify({ updated: new Date().toISOString(), items }, null, 1));
  console.log(`${items.length} posts, ${items.reduce((a, i) => a + i.media.length, 0)} files`);
  if (missing.length) console.log('MISSING:\n' + missing.join('\n'));
})();
