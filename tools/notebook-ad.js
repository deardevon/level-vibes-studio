// "Notebook page" ad: handwriting on cream paper, key words marked with highlighters in the three
// level colours, and simple ink doodles. Written in Devon's voice (about Devon, never about the
// viewer, per Meta's ad rules). Makes a 4:5 feed version and a 9:16 Stories/Reels version.
const fs = require('fs');
const sharp = require('sharp');
const opentype = require('opentype.js');

const OUT = 'C:/Users/deard/OneDrive/Desktop/Level Vibes marketing/Social 1.1/Ads/';
const FONTS = __dirname + '/../node_modules/@expo-google-fonts/caveat/';
const font = (w) => { const b = fs.readFileSync(`${FONTS}${w}/Caveat_${w}.ttf`); return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)); };
const BOLD = font('700Bold'), SEMI = font('600SemiBold');
const INK = '#26282A', PAPER = '#FBF8F1', RULE = '#E7E1D3';
const HL = { g: '#7FD1AE', y: '#F7D35C', r: '#FF8A8A' };

const n = (v) => (Math.round(v * 10) / 10).toString();
const pathD = (f, t, x, y, size) => f.getPath(t, x, y, size).commands.map((c) => (c.type === 'Z' ? 'Z' : c.type === 'C' ? `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}` : c.type === 'Q' ? `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}` : `${c.type}${n(c.x)} ${n(c.y)}`)).join('');

// A line is a list of [text, highlight?] pieces. Highlights go behind their words, a little
// uneven like a real pen stroke.
let seed = 3;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
function line(pieces, x, y, size, f = SEMI, rot = 0) {
  let back = '', front = '', cx = x;
  for (const [t, hl] of pieces) {
    const w = f.getAdvanceWidth(t, size);
    if (hl) {
      const h = size * 0.62, top = y - size * 0.52;
      back += `<path d="M${cx - 8} ${top + rnd() * 6} L${cx + w + 8} ${top + rnd() * 6} L${cx + w + 6} ${top + h + rnd() * 6} L${cx - 6} ${top + h + rnd() * 6} Z" fill="${HL[hl]}" opacity="0.75"/>`;
    }
    front += `<path d="${pathD(f, t, cx, y, size)}" fill="${INK}"/>`;
    cx += w;
  }
  return `<g transform="rotate(${rot} ${x} ${y})">${back}${front}</g>`;
}

// Ink doodles: a couch with a laundry basket, a phone with the three levels, a heart
const ink = (d, w = 4.5) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
function couch(x, y) {
  return `<g transform="translate(${x} ${y})">` +
    ink('M10 70 Q8 30 40 28 L170 26 Q200 26 198 66') + ink('M0 72 Q-4 52 16 52 Q30 54 30 74 L30 110 L180 110 L180 72 Q182 52 198 52 Q216 54 212 76 L210 118 Q120 126 6 118 Z') +
    ink('M40 74 Q100 66 168 74') + ink('M20 118 L18 136 M196 118 L198 136') +
    // a blanket thrown over the arm
    `<path d="M150 30 Q170 60 160 104 L184 102 Q192 60 176 28 Z" fill="${HL.r}" opacity="0.7"/>` + ink('M150 30 Q170 60 160 104 M176 28 Q192 60 184 102', 3) +
    // laundry basket with clothes spilling
    ink('M226 82 L232 136 L290 136 L296 82 Z') + ink('M238 96 L240 128 M252 96 L253 128 M266 96 L266 128 M280 96 L279 128', 3) +
    ink('M226 82 Q240 62 256 74 Q268 56 284 72 Q296 66 296 82', 3.5) + `<path d="M246 70 Q256 60 270 70 Q262 80 246 70 Z" fill="${HL.y}" opacity="0.8"/>` +
    // a sock on the floor and a mug
    ink('M110 150 L128 150 L130 166 L112 168 Q100 168 104 158', 3.5) + ink('M40 146 L40 170 Q52 176 64 170 L64 146 Z M64 152 Q74 154 72 162 Q70 168 64 166', 3.5) +
    '</g>';
}
function phone(x, y) {
  const bars = [['g', 'Level 1'], ['y', 'Level 2'], ['r', 'Level 3']].map(([c, t], i) =>
    `<rect x="22" y="${44 + i * 46}" width="116" height="34" rx="8" fill="${HL[c]}"/>` + `<path d="${pathD(SEMI, t, 46, 70 + i * 46, 30)}" fill="${INK}"/>`).join('');
  return `<g transform="translate(${x} ${y}) rotate(6)">` + ink('M8 0 L152 0 Q160 0 160 8 L160 232 Q160 240 152 240 L8 240 Q0 240 0 232 L0 8 Q0 0 8 0 Z', 5) +
    ink('M64 14 L96 14', 4) + bars + ink('M48 206 L64 222 L112 176', 6) + '</g>' +
    // little "sparkle" dashes around the phone
    [[-30, 40, -10, 50], [-34, 120, -12, 120], [-28, 196, -8, 186], [190, 30, 210, 18], [194, 120, 216, 120], [190, 210, 210, 222]].map(([a, b, c, d]) => ink(`M${x + a} ${y + b} L${x + c} ${y + d}`, 4)).join('');
}
const heart = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s}) rotate(-10)"><path d="M0 18 C-30 -10 -20 -40 0 -22 C20 -40 30 -10 0 18 Z" fill="${HL.r}" opacity="0.85"/>${ink('M0 18 C-30 -10 -20 -40 0 -22 C20 -40 30 -10 0 18 Z', 4)}</g>`;

function page(w, h, top) {
  let rules = '';
  for (let y = top + 60; y < h - 40; y += 64) rules += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${RULE}" stroke-width="2"/>`;
  return `<rect width="${w}" height="${h}" fill="${PAPER}"/>${rules}<line x1="56" y1="0" x2="56" y2="${h}" stroke="#F2B8B8" stroke-width="2"/>`;
}

async function make(file, w, h, top) {
  seed = 3;
  const X = 84, L = 72; // left margin, line spacing
  let y = top + 130, b = page(w, h, top);
  const T = (pieces, size = 64, f = SEMI, dy = L) => { b += line(pieces, X, y, size, f, -1.2 + rnd() * 1.4); y += dy; };
  T([['Hot take for my fellow']], 78, BOLD, 116);
  T([['COUCH SITTERS:', 'y']], 140, BOLD, 136);
  T([['I have '], ['ADHD', 'g'], [' and I’m '], ['autistic', 'g'], [',']]);
  T([['and my house is always '], ['a mess', 'r'], ['.']], 64, SEMI, L + 26);
  T([['Not because I don’t care.']], 64, SEMI, L);
  T([['Because '], ['deciding', 'y'], [' where to start']]);
  T([['is the hardest part.']], 64, SEMI, L + 26);
  T([['So I made an app that picks']]);
  T([['ONE thing', 'g'], [' for me.']]);
  T([['Laundry. Dishes. Dinner.']], 64, SEMI, L + 26);
  T([['It’s free. It’s called '], ['Level Vibes', 'y'], ['.']], 68, BOLD, L + 8);
  T([['Made by someone who gets it.']], 60, SEMI);
  // Doodles in their own row under the words
  const row = Math.min(y - 10, h - 250);
  b += `<g transform="translate(${X + 10} ${row}) scale(1.05)">${couch(0, 0)}</g>`;
  b += `<g transform="translate(${w - 250} ${row - 20}) scale(0.82)">${phone(0, 0)}</g>`;
  b += heart(w - 340, row + 120, 1.3) + heart(w - 395, row + 50, 0.8);
  // scribbly underline under the title
  b += ink(`M${X} ${top + 290} Q${X + 220} ${top + 278} ${X + 560} ${top + 288}`, 4);
  await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${b}</svg>`)).png().toFile(file);
}

(async () => {
  await make(OUT + 'Ad image E - Notebook (feed 4x5).png', 1080, 1350, 0);
  await make(OUT + 'Ad image E - Notebook (9x16).png', 1080, 1920, 260);
  await sharp(OUT + 'Ad image E - Notebook (feed 4x5).png').resize(540).toFile(__dirname + '/../../notebook-preview.jpg');
  console.log('ok');
})();
