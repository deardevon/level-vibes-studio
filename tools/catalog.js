// What's in the library. Every post: a title, a type, its files (relative to the marketing
// folder), a caption, at most 5 hashtags (Instagram's limit) and search tags.
// Reel captions are read from the posting plan; everything else is written here.
const fs = require('fs');

const MK = 'C:/Users/deard/OneDrive/Desktop/Level Vibes marketing/';
const S = 'Social 1.1/';
const R = S + 'Reels series/';
const LINK = 'Free on the App Store, link in bio. 💚💛❤️';

// Captions for reels from "Captions and posting plan.txt": the block under each "NN - Name.mp4" line
function planCaptions() {
  const lines = fs.readFileSync(MK + R + 'Captions and posting plan.txt', 'utf8').replace(/\r/g, '').split('\n');
  const out = {};
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/"(?:Videos\/)?([^"]+\.mp4)"/);
    if (!m || !/^-{3,}/.test(lines[i + 1] || '')) continue;
    const body = [];
    for (let j = i + 2; j < lines.length && lines[j].trim(); j++) body.push(lines[j]);
    out[m[1]] = body;
  }
  return out;
}

// Splits caption lines into the caption text and its hashtags (5 at most, #LevelVibes kept first)
function split(lines) {
  const text = [], tags = [];
  for (const l of lines) {
    if (/^\s*#/.test(l)) tags.push(...l.trim().split(/\s+/).filter((t) => t.startsWith('#')));
    else text.push(l);
  }
  return { caption: text.join('\n').trim(), hashtags: tidyTags(tags) };
}
function tidyTags(tags) {
  const uniq = [...new Set(tags)];
  const lv = uniq.find((t) => t.toLowerCase() === '#levelvibes');
  return [...(lv ? [lv] : []), ...uniq.filter((t) => t !== lv)].slice(0, 5);
}

// Reels: number, file name, extra search tags
const REELS = [
  [1, 'Too tired to decide', 'app demo, chores, low energy'],
  [2, 'Pick again, no judgment', 'app demo, pick again'],
  [3, 'Surprise me', 'app demo'],
  [4, 'Make a list for anything', 'app demo, how it works'],
  [5, 'Rain sounds while you work', 'app demo, timers, focus'],
  [6, 'What it does in 15 seconds', 'app demo, how it works, features'],
  [7, 'Slot machine', 'animation, fun'],
  [8, 'Bold words', 'animation, motivation'],
  [9, 'POV 3pm', 'meme, relatable, funny'],
  [10, 'Your brain vs Level Vibes', 'adhd, relatable'],
  [11, 'Icon reveal', 'app icon, launch'],
  [12, 'Home screen drop', 'app icon, launch'],
  [13, 'One tap ripples', 'app icon'],
  [14, 'Every level counts', 'people, chores, cleaning'],
  [15, 'Level 1 me vs Level 3 me', 'people, funny, chores'],
  [16, 'Which workout today', 'workout, exercise'],
  [17, 'Exercise today', 'workout, exercise, low energy'],
  [18, 'Pick again workout', 'workout, exercise, funny, pick again'],
  [19, 'Less choosing, more watching', 'tv, movie night, couples, weekend'],
  [20, 'Too tired to cook', 'meals, dinner, low energy'],
  [21, 'One small thing, then dance', 'chores, parenting, small wins'],
  [22, 'Open the curtains', 'self-care, mental health, small wins'],
  [23, 'Still scrolling', 'tv, movie night'],
  [24, 'Level 3 energy', 'chores, cleaning, dance'],
  [25, 'Pasta night', 'meals, dinner'],
  [26, 'Friday night', 'friday, weekend, social'],
  [27, 'One email', 'admin, work, small wins'],
  [28, 'ADHD, executive dysfunction, same', 'adhd, neurodivergent, not for ads'],
  [29, 'Halloween energy check', 'halloween, october, seasonal'],
  [30, 'Me after one task', 'trending sound, self-care, funny'],
  [31, 'November energy check', 'november, monthly, seasonal, autumn, fall'],
  [32, 'Monday motivation', 'monday, motivation'],
  [33, 'Still deciding vs let it pick', 'split screen, people, ad'],
  [34, 'Low energy day bingo', 'bingo, low energy, fun'],
  [35, 'My story', 'my story, adhd, autism, personal, about me'],
  [36, 'Holidays pack', 'holidays, christmas, hanukkah, december, seasonal, new feature'],
  [37, 'Sunday walk', 'sunday, walk, exercise'],
  [38, 'Making a deal with Monday', 'monday, pick again, funny'],
  [39, 'What decision fatigue feels like', 'my story, decision fatigue, adhd, autism, chores, personal'],
  [40, 'Workout by energy level', 'workout, exercise'],
];

// Captions for reels whose captions live in other files
const OTHER_REEL_CAPTIONS = {
  32: ['Monday motivation: still loading… 🫠 That\'s okay. You don\'t need motivation, just pick a level. Level 1 counts.', LINK, '#MondayMotivation #LevelVibes #adhd #spoonie #lowenergy'],
  35: ['I have ADHD and I\'m autistic, and for years the hardest part of my day wasn\'t doing things. It was deciding what to do. 🫠', '', 'So I made Level Vibes: tap the energy you\'ve got and it picks one thing that fits. Level 1 days count just as much as Level 3 days.', '', 'It\'s just me behind this little app. If it helps you, I\'d love to hear about it, and a rating on the App Store means the world. 💚💛❤️ Link in bio.', '#adhd #autism #actuallyautistic #indieapp #LevelVibes'],
  36: ['New in Level Vibes: the Holidays pack 🎄 Wrap one present, or wrap them all. Every level counts, even in December.', 'Free update, out now. Link in bio. 💚💛❤️', '#LevelVibes #holidayseason #christmasprep #adhd #spoonie'],
  37: ['Sunday walk? My legs: hmm. 🚶 Level 1: stand outside for two minutes. Level 3: the full podcast walk. Fresh air counts, every step.', LINK, '#SundayWalk #SundayReset #LevelVibes #gentlemovement #spoonie'],
  38: ['Monday picked: clean the whole house. Nope. 🙅 Pick again… and again… until Monday and I reach an agreement. 🤝', LINK, '#MondayMood #LevelVibes #adhd #spoonie #relatable'],
  39: ['I wake up and go downstairs. I pass the messy kitchen and know I should do the dishes, my most difficult chore. I pass the laundry room and know I should do laundry. I walk into the bathroom: the sink, the mirror, the shower wall. I walk back through the same rooms to the living room. This is the room we live in, and you can tell. And I sit down on the couch, the biggest mistake I can make.', '', 'I\'m aware of everything that needs doing, and each thing demands my attention. With it comes guilt.', '', 'Some days I wake up with the energy to get something done. But with a list that long, where do I start? Decision fatigue drains my ambition, and I spend so long deciding that I don\'t want to do anything anymore.', '', 'That\'s why I made Level Vibes. On a Level 1 day it picks one thing, like laundry, and I\'ve accomplished something. 💚💛❤️', '', 'Free on the App Store, link in bio.', '#decisionfatigue #adhd #actuallyautistic #neurodivergent #LevelVibes'],
};

const DAILY = [
  ['Monday', 'chores', 'Monday doesn\'t get to boss you around. Which level are you today?'],
  ['Tuesday', 'meals', 'Cereal counts. Dinner is dinner. Which level?'],
  ['Wednesday', 'self-care', 'Wearing pajamas is self-care. Fight me. Which level?'],
  ['Thursday', 'admin', 'The letter isn\'t going to open itself. Level 1 is just opening it.'],
  ['Friday', 'exercise', '1 minute of stretching still counts as moving.'],
  ['Saturday', 'creative', 'Two minutes of doodling is still making something.'],
  ['Sunday', 'reset', 'A glass of water is a win. Which level are you starting the week on?'],
  ['Monday', 'chores', 'One bag of trash is progress. Where are you at today?'],
  ['Tuesday', 'meals', 'A snack plate is a meal if you believe in yourself.'],
  ['Wednesday', 'self-care', 'Brushing your teeth counts as self-care. Comment your level.'],
  ['Thursday', 'social', 'Sending a meme counts as socializing. Which level?'],
  ['Friday', 'chores', 'Pick up 5 things. That\'s it. That\'s the level.'],
  ['Saturday', 'exercise', 'Dancing to one song counts. Tell me your level.'],
  ['Sunday', 'reset', 'Open the curtains. Tiny win unlocked. Which level are you today?'],
];

const MEMES = [
  ['1 - Energy graph', 'Why is 11pm the only time I want to deep-clean everything? 📈 Tag someone with the same graph.', '#LevelVibes #adhd #adhdmemes #relatable #spoonie', 'funny, relatable, night'],
  ['2 - Dental hygiene by energy level', 'Which level are we on today? 🪥 (Level 1 still counts.)', '#LevelVibes #adhdmemes #lowenergy #selfcare #spoonie', 'self-care, funny'],
  ['3 - Low energy day bingo', 'How many did you get? Comment your number 👇 Screenshot it and share to your story.', '#LevelVibes #bingo #adhdmemes #spoonie #chronicillness', 'bingo, interactive, low energy'],
  ['4 - One small thing', 'Pick Again is a love language. 😤', '#LevelVibes #adhdmemes #relatable #choreapp', 'pick again, funny'],
  ['5 - Nobody, my brain', 'It\'s always the spice rack. 🌶️ What\'s yours?', '#LevelVibes #adhd #adhdmemes #executivedysfunction #relatable', 'adhd, funny'],
  ['6 - Meant to do vs did', 'The list was ambitious. The laundry got done. 🧺 That counts.', '#LevelVibes #adhd #smallwins #adhdmemes #todolist', 'small wins, chores'],
];

const ADS = {
  splitText: 'Still deciding? Let Level Vibes choose for you. Tap the energy you\'ve got and it picks one thing that fits: chores, meals, shows, whatever you need today. Free on iPhone, iPad and Apple Watch.',
  storyText: 'I have ADHD and I\'m autistic. The hardest part of my day was never doing things. It was deciding what to do. So I made Level Vibes: tap the energy you\'ve got, and it picks one thing. Free on iPhone, iPad and Apple Watch.',
  fatigueText: 'Every room has something waiting, and every chore wants my attention at once. I have ADHD and I\'m autistic, and deciding was always the hardest part. So I made Level Vibes: tap the energy you\'ve got, and it picks one thing. Free on iPhone, iPad and Apple Watch.',
};
const adLink = (n) => `https://levelvibes.app/home.html?ct=meta-test-${n}`;

function build() {
  const plan = planCaptions();
  const items = [];
  const add = (o) => items.push({ tags: [], hashtags: [], ...o, tags: (o.tags || '').split(',').map((t) => t.trim()).filter(Boolean) });

  // Reels, newest first
  for (const [n, name, tags] of [...REELS].reverse()) {
    const file = `${n} - ${name}.mp4`;
    const src = OTHER_REEL_CAPTIONS[n] || plan[file] || [];
    const { caption, hashtags } = split(src);
    const extra = n === 33 ? [R + '33 - Still deciding vs let it pick (feed 4x5).mp4'] : [];
    add({ id: `reel-${n}`, num: n, title: name, type: 'reel', files: [R + file, ...extra], caption, hashtags, tags });
  }
  const klingon = split(plan['Social - klingon (1080x1920).mp4'] || []);
  add({ id: 'reel-klingon', title: 'Klingon easter egg', type: 'reel', files: ['Videos/Social - klingon (1080x1920).mp4'], ...klingon, tags: 'star trek, easter egg, fun' });

  // Carousels
  add({
    id: 'car-decision-fatigue', title: 'What decision fatigue feels like', type: 'carousel',
    files: Array.from({ length: 11 }, (_, i) => `${S}Decision fatigue/Carousel/${String(i + 1).padStart(2, '0')}.png`),
    caption: 'This is what decision fatigue looks like in my house. 🫠 Every room has something waiting, every chore wants my attention, and the guilt shows up right on time. Swipe through.\n\nI have ADHD and I\'m autistic, and for me the hardest part was never the doing. It was deciding. So I made Level Vibes: on a Level 1 day it picks one thing, like laundry, and that\'s enough. 💚💛❤️\n\nDoes your house look like slide 7 too? 👇\nFree on the App Store, link in bio.',
    hashtags: tidyTags(['#decisionfatigue', '#adhd', '#actuallyautistic', '#neurodivergent', '#LevelVibes']),
    tags: 'my story, decision fatigue, adhd, autism, chores, personal',
  });
  add({
    id: 'car-features', title: 'What Level Vibes does (features)', type: 'carousel',
    files: fs.readdirSync(MK + S + 'Carousel').filter((f) => f.endsWith('.png')).sort().map((f) => `${S}Carousel/${f}`),
    caption: 'Level Vibes is out now 💚💛❤️ Swipe to see what it does:\n\n→ Tap the level you\'ve got, and it picks the thing\n→ Name your levels: "Take it easy", "Be productive", "Kick ass"\n→ Chores that come back weekly or monthly, on the day you choose\n→ Timers that ring, with rain or waves while you work\n→ Pick from your wrist on Apple Watch ⌚\n→ Share lists with your household\n→ Little wins count: achievements, and no streaks to break\n\nFree on the App Store. The Plus Pack is a one-time unlock, no subscription. Link in bio.',
    hashtags: tidyTags(['#LevelVibes', '#adhd', '#choreapp', '#householdchores', '#applewatch']),
    tags: 'features, how it works, launch, app demo',
  });

  // Images and story sets
  add({ id: 'img-marketing-my-app', title: 'Marketing my own app, by energy level', type: 'image', files: [S + 'Behind the scenes/Marketing my own app (feed).png', S + 'Behind the scenes/Marketing my own app (story).png'],
    caption: 'Behind the scenes of a one-person app 🫠\n\nLevel 1: post something. Level 2: make some content. Level 3: figure out Meta Ads Manager (send help).\n\nI made Level Vibes for days like this: when you can\'t face the whole list, it picks one thing that fits your energy. Even marketing the app gets the Level Vibes treatment.\n\n' + LINK,
    hashtags: tidyTags(['#indieapp', '#buildinpublic', '#solofounder', '#LevelVibes', '#adhd']), tags: 'behind the scenes, indie app, personal, funny' });
  add({ id: 'img-monday-battery', title: 'Monday energy check (batteries)', type: 'image', files: [S + 'Monday 2/Monday energy check meme.png'],
    caption: 'Monday energy check 🔋 Which battery are you today? Comment 1, 2 or 3 👇 (All three count.)', hashtags: tidyTags(['#MondayEnergy', '#LevelVibes', '#adhdmemes', '#spoonie', '#lowenergy']), tags: 'monday, meme, interactive' });
  add({ id: 'img-sunday-plans', title: 'My Sunday plans', type: 'image', files: [S + 'Sunday/Sunday plans meme.png'],
    caption: 'Seven things on the list. One got done. It was the right one. 🛋️ What did your Sunday actually look like?', hashtags: tidyTags(['#SundayMood', '#restday', '#LevelVibes', '#adhdmemes', '#spoonie']), tags: 'sunday, meme, rest, funny' });
  add({ id: 'img-holidays-pack', title: 'Holidays pack announcement', type: 'image', files: [S + 'Holidays pack/Holidays pack post (feed).png', S + 'Holidays pack/Holidays pack story.png'],
    caption: 'The holidays don\'t have to be all or nothing. 🎁 Level 1: wrap one present. Level 3: host the whole crew. Which level are you this week?\nNew in Level Vibes: tap New List +, then Holidays. Free update, out now. Link in bio.',
    hashtags: tidyTags(['#LevelVibes', '#holidays', '#holidaystress', '#adhd', '#smallwins']), tags: 'holidays, christmas, hanukkah, december, seasonal, new feature' });
  add({ id: 'img-monday-motivation', title: 'Monday motivation: optional', type: 'image', files: [S + 'Monday/Monday post (feed).png', S + 'Monday/Monday story.png'],
    caption: 'Monday motivation: optional. ☕ Which level are you starting the week on? 1, 2 or 3 👇', hashtags: tidyTags(['#MondayMotivation', '#MondayMood', '#LevelVibes', '#adhd', '#smallwins']), tags: 'monday, motivation' });
  for (const [i, [day, theme, cap]] of DAILY.entries()) {
    const f = `${String(i + 1).padStart(2, '0')} - ${day} ${theme}.png`;
    add({ id: `daily-${i + 1}`, title: `${day}: ${theme}`, type: 'image', files: [`${S}Daily posts/Feed/${f}`, `${S}Daily posts/Story/${f}`],
      caption: `${cap}\nFree on the App Store. Link in bio.`, hashtags: tidyTags(['#LevelVibes', '#adhd', '#adhdtips', '#executivedysfunction', '#lowenergy']), tags: `${day.toLowerCase()}, ${theme}, daily post` });
  }
  for (const [name, cap, h, tags] of MEMES) {
    add({ id: 'meme-' + name.split(' ')[0], title: name.replace(/^\d+ - /, ''), type: 'image', files: [`${S}Memes/${name}.png`], caption: cap, hashtags: tidyTags(h.split(' ')), tags: 'meme, ' + tags });
  }
  add({ id: 'launch-post', title: 'Launch post (out now)', type: 'image', files: [S + 'Launch post/launch-portrait.png', S + 'Launch post/launch-square.png', S + 'Launch post/launch-story.png'],
    caption: 'It\'s here. Level Vibes is on the App Store! 🎉\n\nSome days you can deep-clean the kitchen. Some days a bowl of cereal counts as dinner. 🥣\n\nLevel Vibes gets that. Tap the level of energy you\'ve got (1, 2 or 3) and it picks one thing to do, so you don\'t have to decide.\n\nChores, meals, workouts, what to watch… make a list for anything. Free on iPhone, iPad and Apple Watch. Link in bio.\n\nPut some vibe in your level. 💚💛❤️',
    hashtags: tidyTags(['#LevelVibes', '#spoonie', '#adhd', '#choreapp', '#indieapp']), tags: 'launch, announcement' });
  add({ id: 'story-set-features', title: 'Feature stories (out now)', type: 'story', files: fs.readdirSync(MK + S + 'Stories').filter((f) => f.endsWith('.png')).sort().map((f) => `${S}Stories/${f}`),
    caption: 'Out now on the App Store! ✨ Add a link sticker: https://apps.apple.com/app/id6815524811', hashtags: [], tags: 'launch, features, stories' });

  // Ads (for Ads Manager on the laptop)
  const A = S + 'Ads/';
  add({ id: 'ad-e', title: 'Ad: Hot take for my fellow couch sitters', type: 'ad', files: [A + 'Ad image E - Notebook (feed 4x5).png', A + 'Ad image E - Notebook (9x16).png'],
    caption: "Hot take: my house isn't messy because I don't care. It's messy because deciding where to start is the hardest part. I have ADHD and I'm autistic, so I made Level Vibes: tap the energy you've got, and it picks one thing. Laundry, dishes, dinner. Free on iPhone, iPad and Apple Watch.",
    headline: 'Made by someone who gets it', link: adLink(4), tags: 'ad, notebook, my story, adhd, autism, chores' });
  add({ id: 'img-couch-sitters', title: 'Hot take for my fellow couch sitters', type: 'image', files: [A + 'Ad image E - Notebook (feed 4x5).png', A + 'Ad image E - Notebook (9x16).png'],
    caption: "Hot take for my fellow couch sitters 🛋️ My house isn't messy because I don't care. Deciding where to start is the hardest part. So I made an app that picks ONE thing for me. Anyone else? 👇\n" + LINK,
    hashtags: tidyTags(['#LevelVibes', '#adhd', '#actuallyautistic', '#decisionfatigue', '#neurodivergent']), tags: 'my story, adhd, autism, chores, notebook, relatable' });
  add({ id: 'ad-c', title: 'Ad: My story', type: 'ad', files: [A + 'Ad video C - My story (feed 4x5).mp4', A + 'Ad video C - My story (9x16).mp4', A + 'Ad image C1 - My story (feed 4x5).png', A + 'Ad image C1 - My story (9x16).png', A + 'Ad image C2 - My story with app (feed 4x5).png', A + 'Ad image C2 - My story with app (9x16).png'],
    caption: ADS.storyText, headline: 'Made by someone who gets it', link: adLink(2), tags: 'ad, my story, adhd, autism, best performer' });
  add({ id: 'ad-d', title: 'Ad: Decision fatigue', type: 'ad', files: [A + 'Ad video D - Decision fatigue (feed 4x5).mp4', A + 'Ad video D - Decision fatigue (9x16).mp4', A + 'Ad image D1 - Decision fatigue (feed 4x5).png', A + 'Ad image D1 - Decision fatigue (9x16).png', A + 'Ad image D2 - It picks one thing (feed 4x5).png', A + 'Ad image D2 - It picks one thing (9x16).png'],
    caption: ADS.fatigueText, headline: 'One thing at a time', link: adLink(3), tags: 'ad, decision fatigue, my story, adhd' });
  add({ id: 'ad-a', title: 'Ad: Still deciding vs let it pick', type: 'ad', files: [A + 'Ad video A - Still deciding vs let it pick (feed 4x5).mp4', A + 'Ad video A - Still deciding vs let it pick.mp4'],
    caption: ADS.splitText, headline: 'Let your energy choose', link: adLink(1), tags: 'ad, split screen, people' });
  add({ id: 'ad-b', title: 'Ad: Less choosing, more watching', type: 'ad', files: [A + 'Ad video B - Less choosing, more watching.mp4'],
    caption: ADS.splitText, headline: 'Let your energy choose', link: adLink(1), tags: 'ad, tv, movie night' });
  add({ id: 'ad-static', title: 'Ad: Can\'t decide what to do?', type: 'ad', files: [A + 'Ad static 4x5.png', A + 'Ad static 1x1.png'],
    caption: ADS.splitText, headline: 'Let your energy choose', link: adLink(1), tags: 'ad, app demo' });

  return items;
}

module.exports = { build, MK };
