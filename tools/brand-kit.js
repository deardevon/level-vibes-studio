// The Level Vibes brand kit: logo files (SVG and PNG, with and without backgrounds, in each brand
// colour), the fonts, and a one-page brand guide (brand-guide.html) with colours, type, logo
// rules and tone of voice. Built into the marketing folder and copied to the Studio site
// (/brand/) so it opens on the phone too. Run: node tools/brand-kit.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const LV = 'C:/dev/level-vibes/';
const KIT = 'C:/Users/deard/OneDrive/Desktop/Level Vibes marketing/Brand kit/';
const SITE = path.join(__dirname, '..', 'brand');
const BC = LV + 'node_modules/@expo-google-fonts/barlow-condensed/';
const CAVEAT = path.join(__dirname, '..', 'node_modules/@expo-google-fonts/caveat/');

// The brand colours: the default "Vibes" theme in the app (src/themes.js)
const COLORS = [
  { group: 'Levels', name: 'Level 1 green', hex: '#3E8A6E', use: 'Level 1, “low energy”. Calm, safe, small wins.' },
  { group: 'Levels', name: 'Level 2 yellow', hex: '#F0BF2A', use: 'Level 2, “some energy”. Highlights, pills, buttons on dark.' },
  { group: 'Levels', name: 'Level 3 coral', hex: '#FF5A5A', use: 'Level 3, “lots of energy”. Also the logo colour.' },
  { group: 'Base', name: 'Charcoal', hex: '#222624', use: 'Main background for social posts; text on light colours.' },
  { group: 'Base', name: 'Cream (paper)', hex: '#F1EEE9', use: 'Light background; text on charcoal.' },
  { group: 'Base', name: 'Charcoal 2', hex: '#2B302D', use: 'Cards and panels on charcoal.' },
  { group: 'Base', name: 'Cream 2', hex: '#E6E2DB', use: 'Cards and panels on cream.' },
  { group: 'Base', name: 'Soft grey (light)', hex: '#5E6560', use: 'Secondary text on cream.' },
  { group: 'Base', name: 'Soft grey (dark)', hex: '#A7ADA9', use: 'Secondary text on charcoal.' },
  { group: 'Text versions', name: 'Green as text (light)', hex: '#2E7358', use: 'Level 1 colour when it’s text on cream (readable).' },
  { group: 'Text versions', name: 'Yellow as text (light)', hex: '#9A7409', use: 'Level 2 colour as text on cream (yellow alone is too pale).' },
  { group: 'Text versions', name: 'Coral as text (light)', hex: '#D63F3F', use: 'Level 3 colour as text on cream; the logo on cream.' },
];
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const cmyk = (hex) => {
  const [r, g, b] = rgb(hex).map((v) => v / 255);
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return [0, 0, 0, 100];
  return [(1 - r - k) / (1 - k), (1 - g - k) / (1 - k), (1 - b - k) / (1 - k), k].map((v) => Math.round(v * 100));
};
const dark = (hex) => { const [r, g, b] = rgb(hex); return 0.299 * r + 0.587 * g + 0.114 * b < 140; };

// Logo colours and backgrounds
const LOGO_COLORS = [['coral', '#FF5A5A'], ['coral-dark', '#D63F3F'], ['charcoal', '#222624'], ['cream', '#F1EEE9'], ['white', '#FFFFFF'], ['black', '#000000']];
const ON_BACKGROUND = [['coral-on-charcoal', '#FF5A5A', '#222624'], ['cream-on-charcoal', '#F1EEE9', '#222624'], ['coral-on-cream', '#D63F3F', '#F1EEE9'], ['charcoal-on-cream', '#222624', '#F1EEE9'], ['charcoal-on-yellow', '#222624', '#F0BF2A'], ['cream-on-green', '#F1EEE9', '#3E8A6E']];

(async () => {
  for (const d of ['Logo/SVG', 'Logo/PNG transparent', 'Logo/PNG with background', 'App icon', 'Fonts']) fs.mkdirSync(KIT + d, { recursive: true });
  const svg = fs.readFileSync(LV + 'public/home/logo.svg', 'utf8');
  const W = 3510, H = 1521;

  // Logo: SVG and transparent PNG in each colour
  for (const [name, hex] of LOGO_COLORS) {
    const coloured = svg.replace(/currentColor/g, hex);
    fs.writeFileSync(`${KIT}Logo/SVG/level-vibes-logo-${name}.svg`, coloured);
    await sharp(Buffer.from(coloured)).resize({ width: 2400 }).png().toFile(`${KIT}Logo/PNG transparent/level-vibes-logo-${name}.png`);
  }
  // Logo on backgrounds: square (posts, profile pictures) and wide (banners)
  for (const [name, ink, bg] of ON_BACKGROUND) {
    const logo = await sharp(Buffer.from(svg.replace(/currentColor/g, ink))).resize({ width: 1500 }).png().toBuffer();
    const lh = Math.round(1500 * H / W);
    await sharp({ create: { width: 2048, height: 2048, channels: 3, background: bg } }).composite([{ input: logo, left: 274, top: Math.round((2048 - lh) / 2) }]).png().toFile(`${KIT}Logo/PNG with background/square-${name}.png`);
    const wideLogo = await sharp(Buffer.from(svg.replace(/currentColor/g, ink))).resize({ width: 1400 }).png().toBuffer();
    const wlh = Math.round(1400 * H / W);
    await sharp({ create: { width: 3000, height: 1000, channels: 3, background: bg } }).composite([{ input: wideLogo, left: 800, top: Math.round((1000 - wlh) / 2) }]).png().toFile(`${KIT}Logo/PNG with background/wide-${name}.png`);
  }
  // App icons
  for (const [file, name] of [['assets/icon.png', 'level-vibes-icon'], ['assets/icons/classic.png', 'level-vibes-icon-classic']]) {
    for (const size of [1024, 512, 180]) await sharp(LV + file).resize(size, size).png().toFile(`${KIT}App icon/${name}-${size}.png`);
  }
  // Fonts (both under the SIL Open Font License, free to use and share)
  for (const w of ['300Light', '400Regular', '500Medium', '700Bold', '800ExtraBold']) fs.copyFileSync(`${BC}${w}/BarlowCondensed_${w}.ttf`, `${KIT}Fonts/BarlowCondensed-${w.replace(/^\d+/, '')}.ttf`);
  fs.copyFileSync(`${BC}LICENSE_FONT`, `${KIT}Fonts/Barlow Condensed licence (OFL).txt`);
  for (const w of ['600SemiBold', '700Bold']) fs.copyFileSync(`${CAVEAT}${w}/Caveat_${w}.ttf`, `${KIT}Fonts/Caveat-${w.replace(/^\d+/, '')}.ttf`);
  fs.copyFileSync(`${CAVEAT}LICENSE_FONT`, `${KIT}Fonts/Caveat licence (OFL).txt`);

  fs.writeFileSync(KIT + 'brand-guide.html', guide());
  // Copy to the Studio site
  fs.rmSync(SITE, { recursive: true, force: true });
  fs.cpSync(KIT, SITE, { recursive: true });
  console.log('brand kit made');
})();

function guide() {
  const swatch = (c) => {
    const [r, g, b] = rgb(c.hex);
    const [C, M, Y, K] = cmyk(c.hex);
    const ink = dark(c.hex) ? '#F1EEE9' : '#222624';
    return `<div class="sw"><div class="chip" style="background:${c.hex};color:${ink}">${c.name}</div>
      <dl><dt>HEX</dt><dd><button class="copy" data-copy="${c.hex}">${c.hex}</button></dd><dt>RGB</dt><dd>${r}, ${g}, ${b}</dd><dt>CMYK</dt><dd>${C}, ${M}, ${Y}, ${K}</dd></dl>
      <p>${c.use}</p></div>`;
  };
  const groups = [...new Set(COLORS.map((c) => c.group))];
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Level Vibes Brand Guide</title>
<style>
@font-face{font-family:BC;font-weight:300;src:url(Fonts/BarlowCondensed-Light.ttf)}
@font-face{font-family:BC;font-weight:400;src:url(Fonts/BarlowCondensed-Regular.ttf)}
@font-face{font-family:BC;font-weight:500;src:url(Fonts/BarlowCondensed-Medium.ttf)}
@font-face{font-family:BC;font-weight:800;src:url(Fonts/BarlowCondensed-ExtraBold.ttf)}
@font-face{font-family:Caveat;font-weight:700;src:url(Fonts/Caveat-Bold.ttf)}
:root{--bg:#222624;--bg2:#2B302D;--ink:#F1EEE9;--soft:#A7ADA9;--line:#474D49;--g:#3E8A6E;--y:#F0BF2A;--r:#FF5A5A}
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--ink);font-family:BC,system-ui,sans-serif;font-size:18px;line-height:1.4}
.wrap{max-width:1000px;margin:0 auto;padding:24px 16px 80px}
h1{font-weight:800;font-size:56px;margin:8px 0 0;letter-spacing:.01em}h2{font-weight:800;font-size:32px;margin:56px 0 12px;text-transform:uppercase;letter-spacing:.02em}
h3{font-weight:500;font-size:22px;margin:24px 0 8px}p,li{color:#DAD6D0}.soft{color:var(--soft)}
.bar{display:flex;height:10px;border-radius:5px;overflow:hidden;margin:16px 0 8px}.bar i{flex:1}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
.sw{background:var(--bg2);border:1px solid var(--line);border-radius:14px;overflow:hidden}.sw .chip{height:96px;display:flex;align-items:flex-end;padding:10px 12px;font-weight:500;font-size:19px}
.sw dl{display:grid;grid-template-columns:52px 1fr;margin:10px 12px 0;gap:2px 8px;font-size:16px}.sw dt{color:var(--soft)}.sw dd{margin:0}.sw p{margin:8px 12px 12px;font-size:15px}
.copy{font:inherit;color:var(--ink);background:none;border:1px dashed var(--line);border-radius:6px;padding:0 6px;cursor:pointer}
.logos{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px}.logos div{border-radius:14px;padding:28px;display:flex;align-items:center;justify-content:center;aspect-ratio:2/1}.logos img{width:80%}
table{width:100%;border-collapse:collapse;font-size:16px}td,th{text-align:left;padding:10px 8px;border-bottom:1px solid var(--line);vertical-align:top}th{color:var(--soft);font-weight:500}
.sample{background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:20px;margin:10px 0}
.do,.dont{border-radius:14px;padding:14px 18px}.do{background:#233A30}.dont{background:#402526}.two{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:14px}
a{color:var(--y)}code{background:var(--bg2);padding:1px 6px;border-radius:5px}
</style></head><body><div class="wrap">
<img src="Logo/SVG/level-vibes-logo-coral.svg" alt="Level Vibes logo" style="width:260px">
<h1>Level Vibes brand guide</h1>
<p class="soft">Tap your energy. It picks the thing. &nbsp;·&nbsp; Last updated ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
<div class="bar"><i style="background:var(--g)"></i><i style="background:var(--y)"></i><i style="background:var(--r)"></i></div>

<h2>The idea</h2>
<p>Level Vibes is a gentle app for low-energy days, made by one person with ADHD who’s autistic. You tap the energy you’ve got (Level 1, 2 or 3) and it gives you one thing to do. The brand should feel like the app: warm, honest, a little funny, never preachy. <b>Every level counts.</b></p>

<h2>Colours</h2>
${groups.map((g) => `<h3>${g}</h3><div class="grid">${COLORS.filter((c) => c.group === g).map(swatch).join('')}</div>`).join('')}
<h3>How to use them</h3>
<ul>
<li><b>The three level colours always mean the same thing:</b> green = Level 1, yellow = Level 2, coral = Level 3. Keep them in that order (green, yellow, coral) whenever they appear together.</li>
<li><b>Charcoal is the home background</b> for most posts. Cream is the light alternative (and the notebook-style ads use a warmer paper, <code>#FBF8F1</code>).</li>
<li>On green, yellow or coral, use <b>charcoal</b> text. On charcoal, use <b>cream</b> text.</li>
<li>Yellow text on cream is too pale to read: use the darker “as text” versions above.</li>
</ul>

<h2>Logo</h2>
<p>The logo is the hand-drawn “Level Vibes” squiggle. Files are in <code>Logo/</code>: <b>SVG</b> (sharp at any size; best for Canva and print), <b>PNG transparent</b>, and <b>PNG with background</b> (square for profile pictures, wide for banners).</p>
<div class="logos">
<div style="background:#222624;border:1px solid #474D49"><img src="Logo/SVG/level-vibes-logo-coral.svg" alt=""></div>
<div style="background:#F1EEE9"><img src="Logo/SVG/level-vibes-logo-coral-dark.svg" alt=""></div>
<div style="background:#F1EEE9"><img src="Logo/SVG/level-vibes-logo-charcoal.svg" alt=""></div>
<div style="background:#222624;border:1px solid #474D49"><img src="Logo/SVG/level-vibes-logo-cream.svg" alt=""></div>
<div style="background:#F0BF2A"><img src="Logo/SVG/level-vibes-logo-charcoal.svg" alt=""></div>
<div style="background:#3E8A6E"><img src="Logo/SVG/level-vibes-logo-cream.svg" alt=""></div>
</div>
<div class="two" style="margin-top:14px">
<div class="do"><b>Do</b><ul><li>Coral on charcoal is the main version.</li><li>On cream, use the darker coral (<code>#D63F3F</code>) or charcoal.</li><li>Leave space around it: at least the height of the “L”.</li></ul></div>
<div class="dont"><b>Don’t</b><ul><li>Stretch, squash, rotate or outline it.</li><li>Put coral logo on coral, or any colour on a busy photo without a solid patch behind it.</li><li>Redraw or retype it in a font.</li></ul></div>
</div>
<h3>App icons</h3>
<p>In <code>App icon/</code>: the current icon and the Classic one, at 1024, 512 and 180 px. Use these when showing the app itself (“on the App Store” graphics).</p>
<div style="display:flex;gap:14px;flex-wrap:wrap"><img src="App icon/level-vibes-icon-180.png" alt="App icon" style="width:96px;border-radius:22px"><img src="App icon/level-vibes-icon-classic-180.png" alt="Classic app icon" style="width:96px;border-radius:22px"></div>

<h2>Type</h2>
<p><b>Barlow Condensed</b> for everything (free, files in <code>Fonts/</code>, also in Canva under the same name). <b>Caveat</b> only for the handwritten “notebook” style.</p>
<table>
<tr><th>Use</th><th>Font and weight</th><th>Size (on a 1080 px wide post)</th><th>Example</th></tr>
<tr><td>Big headlines, bold-word reels</td><td>Barlow Condensed ExtraBold (800), ALL CAPS</td><td>90–160 px</td><td style="font-weight:800;font-size:28px">EVERY LEVEL COUNTS.</td></tr>
<tr><td>Brand name, taglines, calm lines</td><td>Barlow Condensed Light (300)</td><td>60–150 px</td><td style="font-weight:300;font-size:26px">Tap your energy. It picks the thing.</td></tr>
<tr><td>Body text, captions on images</td><td>Barlow Condensed Regular (400)</td><td>48–84 px</td><td style="font-weight:400;font-size:22px">Some days one load of laundry is a win.</td></tr>
<tr><td>Buttons, labels, pills</td><td>Barlow Condensed Medium (500)</td><td>34–56 px</td><td><span style="background:var(--y);color:#222624;font-weight:500;border-radius:999px;padding:4px 14px">Out now on the App Store</span></td></tr>
<tr><td>Notebook / handwritten</td><td>Caveat Bold (700) and SemiBold (600)</td><td>60–140 px</td><td style="font-family:Caveat;font-size:30px">Hot take for my fellow couch sitters:</td></tr>
</table>
<p class="soft">In the app itself: the title is Light 50 pt, levels 30 pt, body 16–19 pt.</p>

<h2>Voice</h2>
<p>Write like Devon talks to a friend who’s having a hard day: honest, warm, a bit funny, never pushy.</p>
<div class="two">
<div class="do"><b>Sounds like Level Vibes</b><ul>
<li>“Some days one load of laundry is a win.”</li><li>“Every level counts.”</li><li>“No pressure. No guilt.”</li>
<li>“Getting started is the hardest part.”</li><li>“Cereal counts. Dinner is dinner.”</li><li>“I made it for me. Maybe it’s for you too.”</li></ul></div>
<div class="dont"><b>Doesn’t</b><ul>
<li>Hustle talk: “crush your goals”, “no excuses”, “level up your productivity”.</li><li>Guilt or shame: “stop being lazy”.</li>
<li>Health promises: “fixes your ADHD”, “cures procrastination”.</li><li>Made-up numbers: “join thousands…” (only real numbers).</li></ul></div>
</div>
<h3>Things to keep true</h3>
<ul>
<li><b>The hard part is getting started</b> (not just deciding). Level Vibes gives you a place to start.</li>
<li><b>Lead with Devon’s story.</b> “I have ADHD and I’m autistic…” has been the best-performing message by far.</li>
<li><b>Streaks:</b> the app does show streaks in History (Plus), so say “no pressure” or “nothing breaks if you skip a day”, not “no streaks”.</li>
<li><b>In ads (Meta’s rules):</b> talk about yourself (“I have ADHD”), never about the viewer (“Do you have ADHD?”, “Your depression…”).</li>
<li><b>Instagram:</b> 5 hashtags at most. Always include <code>#LevelVibes</code>.</li>
<li><b>Spelling:</b> the app and App Store text use American spelling (color, favorite).</li>
</ul>
<h3>Taglines</h3>
<ul><li>Tap your energy. It picks the thing.</li><li>Meet yourself where you are.</li><li>Every level counts.</li><li>Let your energy choose.</li><li>Made by someone who gets it.</li><li>Put some vibe in your level.</li></ul>
<h3>The levels, in words</h3>
<table><tr><th></th><th>Default description</th><th>Feels like</th></tr>
<tr><td><b style="color:var(--g)">Level 1</b></td><td>Quick, low effort</td><td>Running on 3%. Tiny wins: put one thing away, cereal for dinner.</td></tr>
<tr><td><b style="color:var(--y)">Level 2</b></td><td>Medium lift</td><td>Some energy. One load of laundry, a 10-minute walk.</td></tr>
<tr><td><b style="color:var(--r)">Level 3</b></td><td>Big effort, big results</td><td>Fully charged. Deep-clean the kitchen, host the whole crew.</td></tr></table>

<h2>Sizes for posts</h2>
<table><tr><th>Where</th><th>Size (px)</th><th>Keep clear</th></tr>
<tr><td>Reels and Stories</td><td>1080 × 1920 (9:16)</td><td>Top 250 and bottom 400 (Instagram’s buttons and caption)</td></tr>
<tr><td>Feed post / carousel</td><td>1080 × 1350 (4:5)</td><td>A 60 px margin all round</td></tr>
<tr><td>Square</td><td>1080 × 1080</td><td>A 60 px margin all round</td></tr>
<tr><td>Profile picture</td><td>Logo square (in <code>Logo/PNG with background</code>)</td><td>It’s shown as a circle</td></tr>
<tr><td>App Store header</td><td>5244 × 2950 (16:9) image, or 3840 × 1646 (21:9) video</td><td>The iPhone shows only the middle and top; keep text in the centre</td></tr></table>

<h2>The app, in one paragraph</h2>
<div class="sample">Level Vibes picks one thing to do based on the energy you’ve got. Make lists for anything (chores, meals, workouts, what to watch), split them into three levels, tap the level you can handle today, and it picks. Not feeling it? Pick again. Can’t face it? Just 2 minutes counts. Free on iPhone, iPad and Apple Watch, with an optional one-time Plus Pack and no subscription. Made by one person, for days when getting started is the hardest part.</div>
</div>
<script>
document.addEventListener('click',async(e)=>{const b=e.target.closest('[data-copy]');if(!b)return;try{await navigator.clipboard.writeText(b.dataset.copy);const t=b.textContent;b.textContent='Copied';setTimeout(()=>b.textContent=t,1200)}catch(err){}});
</script>
</body></html>`;
}
