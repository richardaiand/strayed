/* STRAYED — a text-based game about a jazz pianist and a stray cat */

const BREEDS = [
  {
    name: "Siamese",
    emoji: "🐱",
    blurb: "Vocal, opinionated, intensely loyal to one person. Will let everyone in the building know how it feels about things."
  },
  {
    name: "Ragdoll",
    emoji: "🐈",
    blurb: "Goes limp when picked up, follows people around like a dog, almost aggressively gentle. Named ragdoll for a reason."
  },
  {
    name: "Maine Coon",
    emoji: "🦁",
    blurb: "Large, confident, dog-like curiosity. Chirps instead of meows. Acts like it has been here before and knows where everything is."
  },
  {
    name: "Sphynx",
    emoji: "🐈‍⬛",
    blurb: "No fur, maximum personality. Seeks warmth constantly — will be on your lap, your keyboard, your face. Cannot be ignored."
  },
  {
    name: "Calico",
    emoji: "🐾",
    blurb: "Not a breed but a coat pattern — three colors, almost always female, and statistically proven to have the most attitude per kilogram."
  }
];

const PERSONALITIES = {
  "Wallflower+Tiny Detective": {
    name: "The Undercover Agent",
    emoji: "🕵️",
    description: "Invisible 90% of the time. The moment you leave the room it's sniffing through your bags, sitting in your open suitcase, reading your mail."
  },
  "Tsundere+Bottomless Pit": {
    name: "The Reluctant Freeloader",
    emoji: "🍗",
    description: "Acts deeply offended by your existence all day. Then 6pm hits and it's figure-eighting your ankles with zero shame. It's not affection. It's dinner time."
  },
  "Little Gremlin+CEO of the Household": {
    name: "The Hostile Takeover",
    emoji: "😈",
    description: "Moved in and immediately started restructuring. Your pillow is its pillow. Your 9am rehearsal is its grooming hour. It didn't ask. It doesn't need to."
  },
  "Velcro Cat+Professional Napper": {
    name: "The Boneless Roommate",
    emoji: "🛋️",
    description: "Goes wherever you go, sleeps wherever you sit. Weighs 4kg but feels like 40. No opinions, no ambitions, no plans. Just warmth, weight, and a purr."
  },
  "Tsundere+CEO of the Household": {
    name: "The Main Character",
    emoji: "🎭",
    description: "Completely indifferent to you — until you have a guest over. Then it performs. Sits in the best light. Accepts exactly three strokes from the visitor."
  }
};

const SOCIAL_STYLES = ["Wallflower", "Tsundere", "Velcro Cat", "Little Gremlin"];
const CORE_DRIVES = ["Bottomless Pit", "Professional Napper", "Tiny Detective", "CEO of the Household"];

/* ---------- PERSONALITY EVENT LIBRARY ----------
 * Each scene can pull a social-style reaction, a core-drive reaction,
 * and extra trait-locked choices. This makes every cat feel different
 * without hand-writing every combination.
 */

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function catTag(tag) {
  if (!state.cat) return false;
  return state.cat.social === tag || state.cat.drive === tag;
}

const SOCIAL_REACTIONS = {
  act1_intro: {
    Wallflower: ["It does not move when I approach. It is watching the ground near my feet, not me."],
    Tsundere: ["It looks away the moment I look at it, then flicks its tail like I have already disappointed it."],
    "Velcro Cat": ["It is already closer than it was five seconds ago. I do not remember it moving."],
    "Little Gremlin": ["It tilts its head. I can see it calculating the resale value of my instrument case."]
  },
  act1_morning: {
    Wallflower: ["When I wake, it is tucked behind the laundry basket. I only know it stayed because the water bowl is empty."],
    Tsundere: ["It is sitting in the exact center of the hallway, pretending it does not care whether I step over it."],
    "Velcro Cat": ["It is asleep on my shoes. I am late. I do not have the heart to move it yet."],
    "Little Gremlin": ["There is a sock on the floor that was not on the floor before. The cat is innocent. Obviously."]
  },
  rehearsal_invasion: {
    Wallflower: ["It does not walk across the keys so much as freeze mid-step, suddenly aware it is the center of attention."],
    Tsundere: ["It plays one deliberate, dissonant chord, then looks at me as if to say, 'You were ignoring me.'"],
    "Velcro Cat": ["It walks across the keyboard on its way to my lap. The chord is incidental. The destination is not."],
    "Little Gremlin": ["It sprints the full length of the keyboard twice, leaves a pencil on the floor, and exits without explanation."]
  },
  label_call: {
    Wallflower: ["It jumps onto the desk, sees the camera, and immediately tries to become part of the wall."],
    Tsundere: ["It plants itself in front of the lens and begins washing its leg with aggressive concentration."],
    "Velcro Cat": ["It curls around the microphone and purrs loud enough to make the A&R rep ask if I have a subwoofer."],
    "Little Gremlin": ["It bats the webcam until the angle is crooked, then sits behind the monitor like a tiny supervisor."]
  },
  emergency: {
    Wallflower: ["It hides under the bed and does not cry. That is the worst part. I have to lie on the floor to see if it is still breathing."],
    Tsundere: ["It glares at me like the emergency is my fault. Maybe it is."],
    "Velcro Cat": ["It presses against my hand, hot and still, and will not let me move more than six inches away."],
    "Little Gremlin": ["It is limp and quiet. I would trade every gig I have ever booked for one more hour of chaos."]
  },
  neighbor: {
    Wallflower: ["The cat is nowhere in sight during the conversation. I find it later inside the bathroom cabinet."],
    Tsundere: ["It watches the entire argument from the top of the bookshelf, radiating silent judgment at both of us."],
    "Velcro Cat": ["It weaves between my ankles the whole time, as if to remind the neighbor that I am already spoken for."],
    "Little Gremlin": ["It chooses this exact moment to knock a glass off the counter and look at me. The timing is almost admirable."]
  },
  gig_conflict: {
    Wallflower: ["It sits on my suitcase while I pack, very small, very still."],
    Tsundere: ["It walks into the bedroom and does not come out. If it is punishing me, it is working."],
    "Velcro Cat": ["It follows me from room to room, close enough to trip me, not close enough to forgive me."],
    "Little Gremlin": ["It has been unusually well-behaved for three hours. I am terrified."]
  },
  recording_trip: {
    Wallflower: ["It watches me pack from the highest shelf in the closet. I cannot reach it. I cannot leave until I do."],
    Tsundere: ["It refuses to acknowledge the suitcase. It also refuses to leave the suitcase."],
    "Velcro Cat": ["It climbs inside the suitcase and looks up at me. There is no room for clothes. There is no argument."],
    "Little Gremlin": ["It has unzipped the suitcase twice. I am starting to think it understands zippers."]
  },
  quiet_night: {
    Wallflower: ["It is asleep in the corner it has decided is safest. I can see one ear twitching."],
    Tsundere: ["It is awake, facing the wall, pretending it does not know I am here."],
    "Velcro Cat": ["It is pressed against my side, heavier than physics should allow."],
    "Little Gremlin": ["It is trying to fit a bottle cap under the couch. This is the most important thing that has ever happened."]
  }
};

const DRIVE_REACTIONS = {
  act1_intro: {
    "Bottomless Pit": ["It meows once, a small sound, but it is the sound of an invoice."],
    "Professional Napper": ["It yawns so wide I can see its whole life philosophy."],
    "Tiny Detective": ["It sniffs my case, my shoes, my hand, in that order. Evidence is being collected."],
    "CEO of the Household": ["It does not wait to be invited. It walks past me into the apartment like it owns the lease."]
  },
  act1_morning: {
    "Bottomless Pit": ["The food dish I put down is empty before I finish my coffee."],
    "Professional Napper": ["It has rotated through three sleeping spots since breakfast and has not woken once."],
    "Tiny Detective": ["Every bag in the apartment has been investigated. Every shoe has been sniffed."],
    "CEO of the Household": ["It has claimed the piano bench. The piano bench was mine yesterday."]
  },
  rehearsal_invasion: {
    "Bottomless Pit": ["It stops mid-keyboard-walk to see if there is food involved. There is not. It walks anyway."],
    "Professional Napper": ["It plays the chord, then curls up on the sustain pedal. The note rings forever."],
    "Tiny Detective": ["It investigates every knob on the keyboard while my bandmate is still laughing."],
    "CEO of the Household": ["It sits on the highest key like a tiny executive chair."]
  },
  label_call: {
    "Bottomless Pit": ["It is blocking the camera because it has decided now is dinner time."],
    "Professional Napper": ["It falls asleep on the warm laptop. The rep thinks I have a very relaxed paperweight."],
    "Tiny Detective": ["It sniffs the camera lens, then the rep's voice, then my shirt. Something does not add up."],
    "CEO of the Household": ["It stares into the lens because someone must be in charge of this meeting."]
  },
  emergency: {
    "Bottomless Pit": ["It refused its favorite food. That is when I knew."],
    "Professional Napper": ["It is too still. A cat that sleeps this much should not be this still."],
    "Tiny Detective": ["It keeps sniffing its own side, then looking at me, then sniffing again. It found something I cannot see."],
    "CEO of the Household": ["It is weak, but it still tries to walk to the door first. Some instincts do not turn off."]
  },
  neighbor: {
    "Bottomless Pit": ["It cries at 5am because it has already forgotten the midnight snack."],
    "Professional Napper": ["It sleeps through the entire conversation. The neighbor does not believe me."],
    "Tiny Detective": ["It has been watching the neighbor's window for two days. I think it knows about the treats."],
    "CEO of the Household": ["It answers the neighbor's complaints with a slow blink from my shoulder."]
  },
  gig_conflict: {
    "Bottomless Pit": ["It has been staring at the empty food bowl for ten minutes to make me feel guilt."],
    "Professional Napper": ["It sleeps on my gig bag. It has never slept on my gig bag before."],
    "Tiny Detective": ["It has been inspecting the suitcase since I pulled it out. It knows what luggage means."],
    "CEO of the Household": ["It sits on my setlist like it is vetoing the whole tour."]
  },
  recording_trip: {
    "Bottomless Pit": ["It is trying to fit into my backpack. I think it assumes all bags contain snacks."],
    "Professional Napper": ["It is asleep on my folded clothes. I do not have the heart to pack them."],
    "Tiny Detective": ["It has already explored the suitcase and is now sitting in it like a verdict."],
    "CEO of the Household": ["It has parked itself on the contract. The message is not subtle."]
  },
  quiet_night: {
    "Bottomless Pit": ["It is awake because it heard me think about a snack."],
    "Professional Napper": ["It is asleep in three different positions at once."],
    "Tiny Detective": ["It keeps opening one eye to check if I am still here."],
    "CEO of the Household": ["It is sitting on the highest point in the room, surveying its quiet kingdom."]
  }
};

function sceneText(event) {
  const social = (SOCIAL_REACTIONS[event] && SOCIAL_REACTIONS[event][state.cat.social]) || [""];
  const drive = (DRIVE_REACTIONS[event] && DRIVE_REACTIONS[event][state.cat.drive]) || [""];
  return `${pick(social)} ${pick(drive)}`.trim();
}

function finalizeOptions(options) {
  // Remove duplicate action keys, keep first, shuffle, cap at 4
  const seen = new Set();
  const unique = [];
  for (const opt of options) {
    const key = opt.key || opt.label;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(opt);
  }
  for (let i = unique.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [unique[i], unique[j]] = [unique[j], unique[i]];
  }
  return unique.slice(0, 4);
}

const SAVE_KEY = "strayed_save_v1";
const UNLOCKS_KEY = "strayed_unlocks_v1";

function loadUnlocks() {
  try {
    const raw = localStorage.getItem(UNLOCKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

function saveUnlock(breedName) {
  try {
    const unlocked = new Set(loadUnlocks());
    unlocked.add(breedName);
    localStorage.setItem(UNLOCKS_KEY, JSON.stringify(Array.from(unlocked)));
    state.unlockedBreeds = Array.from(unlocked);
  } catch (e) {
    // ignore
  }
}

const state = {
  cat: null,
  trust: 10,
  scene: "breed_select",
  choices: {},
  log: [],
  awaitingInput: false,
  freeInputTarget: null,
  unlockedBreeds: loadUnlocks()
};

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (e) {
    // localStorage may be unavailable or full; fail silently
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved || !saved.scene || saved.scene === "breed_select" || saved.scene === "start") return null;
    if (!saved.cat || !saved.cat.breed || !saved.cat.breed.name) return null;
    const validBreeds = BREEDS.map(b => b.name);
    if (!validBreeds.includes(saved.cat.breed.name)) return null;
    return saved;
  } catch (e) {
    return null;
  }
}

function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {
    // ignore
  }
}

const dom = {
  passage: document.getElementById("passage"),
  choices: document.getElementById("choices"),
  dialogueBox: document.getElementById("dialogue-box"),
  namePlate: document.getElementById("name-plate"),
  advanceIndicator: document.getElementById("advance-indicator"),
  catInfo: document.getElementById("cat-info"),
  catMood: document.getElementById("cat-mood"),
  catName: document.getElementById("cat-name"),
  catBreed: document.getElementById("cat-breed"),
  catPersonality: document.getElementById("cat-personality"),
  trustFill: document.getElementById("trust-fill"),
  trustLabel: document.getElementById("trust-label"),
  freeInput: document.getElementById("free-input"),
  inputPrompt: document.getElementById("input-prompt"),
  playerText: document.getElementById("player-text"),
  submitText: document.getElementById("submit-text"),
  log: document.getElementById("log"),
  logList: document.getElementById("log-list"),
  restart: document.getElementById("restart"),
  toggleLog: document.getElementById("toggle-log"),
  canvas: document.getElementById("pixel-canvas"),
  breedOverlay: document.getElementById("breed-overlay")
};

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateCatForBreed(breed) {
  const seed = Date.now() + Math.floor(Math.random() * 10000);
  const rng = seededRandom(seed);
  const social = SOCIAL_STYLES[Math.floor(rng() * SOCIAL_STYLES.length)];
  const drive = CORE_DRIVES[Math.floor(rng() * CORE_DRIVES.length)];
  const key = `${social}+${drive}`;
  const personality = PERSONALITIES[key] || {
    name: "The Unclassifiable",
    emoji: "❓",
    description: "A singular arrangement of contradictions."
  };
  const gender = breed.name === "Calico" ? "female" : (rng() > 0.5 ? "male" : "female");
  return { breed, personality, social, drive, gender, name: "the cat" };
}

function updateCatCard() {
  if (!state.cat) return;
  dom.catInfo.classList.remove("hidden");
  dom.catName.textContent = state.cat.name === "the cat" ? "the cat" : state.cat.name;
  dom.catBreed.textContent = `${state.cat.breed.name} · ${state.cat.gender}`;
  dom.catPersonality.textContent = `${state.cat.personality.name}`;
  updateTrustBar();
}

function updateTrustBar() {
  const pct = Math.max(0, Math.min(100, state.trust));
  dom.trustFill.style.width = `${pct}%`;
  let label = "uncertain";
  let mood = "🐈";
  if (pct < 20) { label = "wary"; mood = "😾"; }
  else if (pct < 40) { label = "curious"; mood = "🐈"; }
  else if (pct < 60) { label = "settling in"; mood = "😺"; }
  else if (pct < 80) { label = "attached"; mood = "😻"; }
  else { label = "yours"; mood = "💛"; }
  if (dom.catMood) dom.catMood.textContent = mood;
  dom.trustLabel.textContent = `mood: ${label}`;
}

function adjustTrust(delta) {
  state.trust = Math.max(0, Math.min(100, state.trust + delta));
  updateTrustBar();
}

function startWithBreed(breed) {
  if (dom.breedOverlay) {
    dom.breedOverlay.classList.add("hidden");
    dom.breedOverlay.classList.remove("active");
    dom.breedOverlay.innerHTML = "";
  }
  window.onBreedHover = null;
  state.cat = generateCatForBreed(breed);
  // eslint-disable-next-line no-console
  console.log("[strayed] started with breed:", state.cat.breed.name);
  state.trust = 10;
  state.scene = "act1_intro";
  state.choices = {};
  state.log = [];
  dom.logList.innerHTML = "";
  dom.restart.classList.add("hidden");
  dom.toggleLog.classList.add("hidden");
  dom.log.classList.add("hidden");
  updateCatCard();
  goToScene("act1_intro");
}

function returnToBreedSelect() {
  if (dom.canvas) dom.canvas.classList.add("selectable");
  state.cat = null;
  state.trust = 10;
  state.scene = "breed_select";
  state.choices = {};
  state.log = [];
  state.endingKey = null;
  state.awaitingInput = false;
  state.freeInputTarget = null;
  dom.logList.innerHTML = "";
  dom.catInfo.classList.add("hidden");
  dom.restart.classList.add("hidden");
  dom.toggleLog.classList.add("hidden");
  dom.log.classList.add("hidden");
  clearSave();
  goToScene("breed_select");
}

function logEvent(text) {
  state.log.push(text);
  const li = document.createElement("li");
  li.textContent = text;
  dom.logList.appendChild(li);
}

/* ---------- Phoenix Wright style dialogue system ---------- */

let dialogueQueue = [];
let dialogueIndex = 0;
let typewriterTimer = null;
let currentSpeaker = "RAY";
let dialogueComplete = false;
let afterDialogueCb = null;

function setSpeaker(name) {
  currentSpeaker = name;
  dom.namePlate.textContent = name;
  dom.namePlate.className = "name-plate";
  if (name === "THE CAT" || name === "CAT") dom.namePlate.classList.add("cat");
  else if (name === "NARRATION" || name === "—") dom.namePlate.classList.add("narration");
  else if (name === "NEIGHBOR") dom.namePlate.classList.add("neighbor");
}

function clearTypewriter() {
  if (typewriterTimer) {
    clearInterval(typewriterTimer);
    typewriterTimer = null;
  }
}

function showAdvanceIndicator() {
  dom.advanceIndicator.classList.remove("hidden");
}

function hideAdvanceIndicator() {
  dom.advanceIndicator.classList.add("hidden");
}

function typeOut(text) {
  clearTypewriter();
  dialogueComplete = false;
  hideAdvanceIndicator();
  dom.passage.textContent = "";
  let i = 0;
  const speed = 18;
  typewriterTimer = setInterval(() => {
    if (i < text.length) {
      dom.passage.textContent = text.slice(0, i + 1);
      i++;
    } else {
      clearTypewriter();
      dialogueComplete = true;
      if (dialogueIndex < dialogueQueue.length - 1 || afterDialogueCb) {
        showAdvanceIndicator();
      }
    }
  }, speed);
}

function advanceDialogue() {
  if (!dialogueComplete) {
    // Skip typewriter, show full text immediately
    clearTypewriter();
    const current = dialogueQueue[dialogueIndex];
    if (current) dom.passage.textContent = current.text;
    dialogueComplete = true;
    if (dialogueIndex < dialogueQueue.length - 1 || afterDialogueCb) {
      showAdvanceIndicator();
    }
    return;
  }

  dialogueIndex++;
  if (dialogueIndex < dialogueQueue.length) {
    const next = dialogueQueue[dialogueIndex];
    setSpeaker(next.speaker);
    typeOut(next.text);
  } else {
    hideAdvanceIndicator();
    const cb = afterDialogueCb;
    afterDialogueCb = null;
    if (cb) cb();
  }
}

function showPassage(text, speaker, callback) {
  afterDialogueCb = callback || null;
  dialogueQueue = [{ speaker: speaker || "RAY", text: text }];
  dialogueIndex = 0;
  setSpeaker(dialogueQueue[0].speaker);
  hideChoices();
  typeOut(dialogueQueue[0].text);
}

function showDialogue(lines, callback) {
  afterDialogueCb = callback || null;
  dialogueQueue = lines;
  dialogueIndex = 0;
  setSpeaker(dialogueQueue[0].speaker);
  hideChoices();
  typeOut(dialogueQueue[0].text);
}

// Click anywhere on the dialogue box to advance
dom.dialogueBox.addEventListener("click", advanceDialogue);

function showChoices(options) {
  dom.choices.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt.label;
    btn.addEventListener("click", () => opt.action());
    dom.choices.appendChild(btn);
  });
}

function hideChoices() {
  dom.choices.innerHTML = "";
}

function clearFreeInput() {
  dom.freeInput.classList.add("hidden");
  dom.inputPrompt.textContent = "";
  dom.playerText.value = "";
  state.awaitingInput = false;
  state.freeInputTarget = null;
}

function analyzeTone(text) {
  const lower = text.toLowerCase();
  const tones = {
    gentle: ["soft", "gentle", "nice", "sweet", "love", "pet", "sorry", "easy", "slow", "calm", "kind", "care", "good"],
    impatient: ["go", "away", "move", "out", "leave", "stop", "shoo", "now", "hurry", "damn", "hell", "quiet", "down"],
    playful: ["play", "toy", "pounce", "catch", "silly", "weirdo", "buddy", "pal", "come", "here", "jump", "mouse"],
    distracted: ["later", "busy", "work", "soon", "maybe", "tomorrow", "later", "after"]
  };
  let scores = { gentle: 0, impatient: 0, playful: 0, distracted: 0 };
  Object.keys(tones).forEach(tone => {
    tones[tone].forEach(word => {
      if (lower.includes(word)) scores[tone]++;
    });
  });
  const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return winner[1] > 0 ? winner[0] : "neutral";
}

function catReaction(tone) {
  const { social, drive, breed } = state.cat;
  const reactions = {
    gentle: [
      "It blinks at you, slow and deliberate.",
      "A small sound escapes it, almost accidental.",
      "It leans in, just barely.",
      "The tension in its shoulders softens a fraction."
    ],
    impatient: [
      "It flicks its tail and looks away.",
      "Its ears flatten for a second, then relax.",
      "It does not move. It does not have to.",
      "You catch a low, uncertain noise from its throat."
    ],
    playful: [
      "Its tail twitches with interest.",
      "It crouches, then thinks better of it.",
      "One paw lifts, hesitates, settles again.",
      "Something playful flickers behind its eyes."
    ],
    distracted: [
      "It watches you a moment longer, then loses interest.",
      "It turns and begins grooming one leg.",
      "Its attention drifts to the window.",
      "It does not seem to register the words, only the distance."
    ],
    neutral: [
      "It stares back, unreadable.",
      "The cat tilts its head, considering.",
      "No response. Not yet.",
      "It stays where it is, waiting to see what happens next."
    ]
  };

  let pool = reactions[tone];
  if (social === "Wallflower") pool = tone === "gentle" || tone === "neutral" ? pool : [...pool, "It takes a step back, then stops.", "It watches from the corner it has claimed."];
  if (social === "Tsundere") pool = tone === "impatient" ? [...pool, "It acts like it didn't hear you.", "It grooms itself with sudden, aggressive focus."] : pool;
  if (social === "Velcro Cat") pool = [...pool, "It presses closer.", "It follows your voice like a compass needle."];
  if (social === "Little Gremlin") pool = tone === "playful" ? [...pool, "Its eyes go wide with terrible ideas.", "It flicks its tail like a metronome set to chaos."] : pool;
  if (drive === "Bottomless Pit") pool = [...pool, "It glances toward the kitchen."];
  if (drive === "Professional Napper") pool = [...pool, "It yawns, unimpressed.", "It finds a flat surface and melts onto it."];
  if (drive === "Tiny Detective") pool = [...pool, "It sniffs the air near your shoes.", "Its gaze moves to your bag, then back to you."];
  if (drive === "CEO of the Household") pool = [...pool, "It blinks once, slowly, as if accepting a report.", "It claims the nearest elevated surface."];
  if (breed.name === "Siamese") pool = [...pool, "It answers with a long, opinionated trill."];
  if (breed.name === "Maine Coon") pool = [...pool, "It chirps instead of meowing."];
  if (breed.name === "Sphynx") pool = [...pool, "It presses its warm, furless side against your ankle."];

  return randomChoice(pool);
}

function freeInputTrustDelta(tone) {
  const { social, drive } = state.cat;
  const base = { gentle: 8, playful: 6, impatient: -3, distracted: -1, neutral: 2 };
  let delta = base[tone] || 2;

  // Social style preferences
  if (social === "Tsundere") {
    if (tone === "gentle") delta += 3;
    if (tone === "playful") delta += 1;
    if (tone === "impatient") delta -= 2; // scolding backfires
  }
  if (social === "Wallflower") {
    if (tone === "gentle") delta += 3;
    if (tone === "playful") delta += 1;
    if (tone === "impatient") delta -= 4;
  }
  if (social === "Velcro Cat") {
    if (tone === "gentle" || tone === "playful") delta += 2;
    if (tone === "distracted") delta -= 3;
  }
  if (social === "Little Gremlin") {
    if (tone === "playful") delta += 4;
    if (tone === "gentle") delta += 1;
    if (tone === "impatient") delta -= 1;
  }

  // Core drive preferences
  if (drive === "CEO of the Household") {
    if (tone === "impatient") delta += 1; // respects directness
    if (tone === "distracted") delta -= 2;
  }
  if (drive === "Bottomless Pit") {
    if (tone === "gentle") delta += 1;
    if (tone === "playful") delta += 1;
  }
  if (drive === "Tiny Detective") {
    if (tone === "playful") delta += 2;
    if (tone === "distracted") delta -= 1;
  }
  if (drive === "Professional Napper") {
    if (tone === "gentle") delta += 2;
    if (tone === "impatient") delta -= 1;
  }

  return delta;
}

function offerFreeInput(prompt, target, onSubmit) {
  state.awaitingInput = true;
  state.freeInputTarget = target;
  hideChoices();
  hideAdvanceIndicator();
  dom.freeInput.classList.remove("hidden");
  dom.inputPrompt.textContent = prompt;
  dom.playerText.focus();

  const handler = () => {
    const text = dom.playerText.value.trim();
    if (!text) return;
    const tone = analyzeTone(text);
    const reaction = catReaction(tone);
    clearFreeInput();
    logEvent(`You said: "${text}" — the cat seemed ${tone}.`);

    const trustDelta = freeInputTrustDelta(tone);
    adjustTrust(trustDelta);

    onSubmit({ text, tone, reaction, trustDelta });
  };

  dom.submitText.onclick = handler;
  dom.playerText.onkeydown = (e) => {
    if (e.key === "Enter") handler();
  };
}

function goToScene(sceneName) {
  if (sceneName !== "breed_select") {
    window.onBreedHover = null;
  }
  state.scene = sceneName;
  if (dom.canvas) {
    dom.canvas.classList.toggle("selectable", sceneName === "breed_select");
  }
  // eslint-disable-next-line no-console
  console.log("[strayed] scene:", sceneName, "breed:", state.cat ? state.cat.breed.name : "none");
  if (SCENES[sceneName]) {
    SCENES[sceneName]();
  } else {
    showPassage("[The night ends here.]");
    hideChoices();
  }
  saveGame();
  if (window.renderScene) window.renderScene(sceneName, state);
}

/* ---------------- SCENES ---------------- */

const SCENES = {
  breed_select() {
    dom.logList.innerHTML = "";
    dom.restart.classList.add("hidden");
    dom.toggleLog.classList.add("hidden");
    dom.log.classList.add("hidden");
    dom.catInfo.classList.add("hidden");
    dom.choices.innerHTML = "";
    hideAdvanceIndicator();

    setSpeaker("NARRATION");
    const unlocked = new Set(state.unlockedBreeds);
    const unlockedCount = unlocked.size;
    const basePrompt = unlockedCount === 0
      ? "Five shapes in the apartment. Click one to choose your cat."
      : `Five shapes in the apartment. ${unlockedCount === 5 ? "All" : unlockedCount} remembered. Click one to choose again.`;
    dom.passage.textContent = basePrompt;

    if (dom.breedOverlay) {
      dom.breedOverlay.innerHTML = "";
      dom.breedOverlay.classList.remove("hidden");
      dom.breedOverlay.classList.add("active");

      // Cat sprite positions in the 128x80 scene
      const positions = [5, 30, 55, 80, 105];
      const slotW = 25 / 128 * 100;
      const slotH = 22 / 80 * 100;
      const top = 38 / 80 * 100;

      BREEDS.forEach((breed, i) => {
        const x = positions[i];
        const isUnlocked = unlocked.has(breed.name);

        const btn = document.createElement("button");
        btn.className = "breed-slot";
        btn.style.left = `${(x / 128) * 100}%`;
        btn.style.top = `${top}%`;
        btn.style.width = `${slotW}%`;
        btn.style.height = `${slotH}%`;
        btn.setAttribute("aria-label", isUnlocked ? breed.name : "unknown cat");

        const label = document.createElement("span");
        label.className = "slot-label";
        label.textContent = isUnlocked ? `${breed.emoji} ${breed.name}` : "???";
        btn.appendChild(label);

        btn.addEventListener("mouseenter", () => {
          dom.passage.textContent = isUnlocked
            ? `${breed.emoji} ${breed.name}\n${breed.blurb}`
            : "???\nYou don't know this one yet.";
        });
        btn.addEventListener("mouseleave", () => {
          dom.passage.textContent = basePrompt;
        });
        btn.addEventListener("click", () => startWithBreed(breed));

        dom.breedOverlay.appendChild(btn);
      });
    }
  },

  act1_intro() {
    const catLine = sceneText("act1_intro");
    showDialogue([
      { speaker: "RAY", text: "The gig is over. The club has emptied out, and the alley behind it smells like rain that never came. My fingers are still warm from the keys. My shoulders are not." },
      { speaker: "RAY", text: `There's something sitting beside my instrument case. A cat. ${catLine}` },
      { speaker: "RAY", text: "I have a 10am call with a record label tomorrow. I do not have room for this." }
    ], () => {
      const options = [
        { label: "Let it in for just one night", action: () => { adjustTrust(12); state.choices.act1 = "let_in"; logEvent("Act 1: You let the cat in for one night."); goToScene("act1_morning"); } },
        { label: "Leave water outside and go to bed", action: () => { adjustTrust(4); state.choices.act1 = "water"; logEvent("Act 1: You left water outside."); goToScene("act1_morning"); } },
        { label: "Try to shoo it away", action: () => { adjustTrust(-4); state.choices.act1 = "shoo"; logEvent("Act 1: You tried to shoo the cat away."); goToScene("act1_morning"); } }
      ];
      if (catTag("CEO of the Household")) {
        options.push({ label: "Step aside and let it lead the way in", action: () => { adjustTrust(14); state.choices.act1 = "let_in"; logEvent("Act 1: You let the CEO cat take charge."); goToScene("act1_morning"); } });
      }
      if (catTag("Bottomless Pit")) {
        options.push({ label: "Open a can of tuna first, then decide", action: () => { adjustTrust(10); state.choices.act1 = "let_in"; logEvent("Act 1: You bribed it with tuna."); goToScene("act1_morning"); } });
      }
      showChoices(finalizeOptions(options));
    });
  },

  act1_morning() {
    updateCatCard();
    const baseReaction = state.choices.act1 === "let_in"
      ? "It slept under the radiator and was gone before sunrise."
      : state.choices.act1 === "water"
        ? "The bowl was empty when I woke. The cat was not."
        : "It let me close the door. Then it sat outside it all night.";
    const personalityLine = sceneText("act1_morning");

    showDialogue([
      { speaker: "RAY", text: `Morning comes too early. ${baseReaction} ${personalityLine}` },
      { speaker: "RAY", text: "The label call goes better than I expected. They want to hear more. They want to see me. I hang up and notice the scratches on my door, the empty windowsill, the silence that is somehow louder than it used to be." },
      { speaker: "RAY", text: "That evening, the cat is back. Same spot. Same look. It is not asking permission." },
      { speaker: "RAY", text: `It is a ${state.cat.breed.name}. ${state.cat.breed.blurb}` },
      { speaker: "RAY", text: `And it is ${state.cat.personality.name.toLowerCase()}. ${state.cat.personality.description}` }
    ], () => {
      offerFreeInput(
        "You should call it something. What do you name the cat?",
        "act1_name",
        ({ text, tone }) => {
          const name = text.trim() || state.cat.breed.name;
          state.cat.name = name;
          updateCatCard();
          logEvent(`You named the cat ${name}.`);

          const toneNote = tone === "gentle" ? " softly." : tone === "impatient" ? " with more edge than intended." : ".";
          showDialogue([
            { speaker: "RAY", text: `${name}. I say it out loud${toneNote} The cat does not respond, but it does not leave either.` },
            { speaker: "RAY", text: "I go to bed with the door open a few inches more than last night." }
          ], () => {
            showChoices([
              { label: "Begin the long negotiation →", action: () => goToScene("rehearsal_invasion") }
            ]);
          });
        }
      );
    });
  },

  rehearsal_invasion() {
    const catLine = sceneText("rehearsal_invasion");
    showDialogue([
      { speaker: "RAY", text: "I'm running a home practice session. My bandmate is on the call, half-listening, half-texting. I find the groove of a new piece — something slower, something that might be good — and then the cat walks across my keyboard." },
      { speaker: "RAY", text: `The chord it plays does not exist in any theory book. ${catLine}` }
    ], () => {
      const options = [
        { label: "Laugh it off and keep the take", action: () => { adjustTrust(10); state.choices.rehearsal = "laugh"; logEvent("Rehearsal: You laughed it off."); goToScene("label_call"); } },
        { label: "Lock the cat out of the room from now on", action: () => { adjustTrust(-6); state.choices.rehearsal = "lock"; logEvent("Rehearsal: You locked the cat out."); goToScene("label_call"); } },
        { label: "Try to compose around the chord", action: () => { adjustTrust(8); state.choices.rehearsal = "compose"; logEvent("Rehearsal: You composed around the cat's chord."); goToScene("label_call"); } }
      ];
      if (catTag("Little Gremlin")) {
        options.push({ label: "Record the chaos and sample it later", action: () => { adjustTrust(12); state.choices.rehearsal = "sample"; logEvent("Rehearsal: You sampled the chaos."); goToScene("label_call"); } });
      }
      if (catTag("Professional Napper")) {
        options.push({ label: "Let it sleep on the sustain pedal", action: () => { adjustTrust(9); state.choices.rehearsal = "pedal"; logEvent("Rehearsal: You let it nap on the pedal."); goToScene("label_call"); } });
      }
      showChoices(finalizeOptions(options));
    });
  },

  label_call() {
    const catLine = sceneText("label_call");
    showDialogue([
      { speaker: "RAY", text: "The A&R rep. The big one. The one who actually signs people. I put on a clean shirt and angle the lamp so the apartment looks like somewhere an adult lives." },
      { speaker: "RAY", text: `Five minutes in, the cat jumps onto the desk. ${catLine}` }
    ], () => {
      const options = [
        { label: "Introduce it to the rep like it belongs there", action: () => { adjustTrust(10); state.choices.labelCall = "introduce"; logEvent("Label call: You introduced the cat."); goToScene("emergency"); } },
        { label: "Move it off the desk gently", action: () => { adjustTrust(3); state.choices.labelCall = "move"; logEvent("Label call: You moved the cat off the desk."); goToScene("emergency"); } },
        { label: "Pretend nothing is happening", action: () => { adjustTrust(-2); state.choices.labelCall = "ignore"; logEvent("Label call: You pretended nothing was happening."); goToScene("emergency"); } }
      ];
      if (catTag("CEO of the Household")) {
        options.push({ label: "Let it take the meeting. You handle the notes.", action: () => { adjustTrust(12); state.choices.labelCall = "delegate"; logEvent("Label call: You let the cat run the meeting."); goToScene("emergency"); } });
      }
      if (catTag("Tiny Detective")) {
        options.push({ label: "Let it sniff the rep. Maybe it knows something.", action: () => { adjustTrust(8); state.choices.labelCall = "sniff"; logEvent("Label call: You let the cat investigate."); goToScene("emergency"); } });
      }
      showChoices(finalizeOptions(options));
    });
  },

  emergency() {
    const catLine = sceneText("emergency");
    showDialogue([
      { speaker: "RAY", text: "3am. The cat is not eating. It is not moving much. Something is wrong in the way wrong things are wrong before you have words for them." },
      { speaker: "RAY", text: `${catLine} The all-night vet is forty minutes away. I have a studio session at 8am with a producer flying in from out of town. I cannot reschedule. I cannot do both perfectly.` }
    ], () => {
      const options = [
        { label: "Take it to the vet and risk the session", action: () => { adjustTrust(18); state.choices.emergency = "vet"; logEvent("Emergency: You went to the vet."); goToScene("neighbor"); } },
        { label: "Call the vet for advice and go to the session", action: () => { adjustTrust(5); state.choices.emergency = "call"; logEvent("Emergency: You called the vet for advice."); goToScene("neighbor"); } },
        { label: "Go to the session; the cat will probably be fine", action: () => { adjustTrust(-8); state.choices.emergency = "session"; logEvent("Emergency: You went to the session."); goToScene("neighbor"); } }
      ];
      if (catTag("Velcro Cat")) {
        options.push({ label: "Wrap it in your shirt and take it with you", action: () => { adjustTrust(16); state.choices.emergency = "shirt"; logEvent("Emergency: You carried the cat with you."); goToScene("neighbor"); } });
      }
      if (catTag("Tsundere")) {
        options.push({ label: "Pretend you're only going to the vet because you were awake anyway", action: () => { adjustTrust(14); state.choices.emergency = "casual"; logEvent("Emergency: You played it cool."); goToScene("neighbor"); } });
      }
      showChoices(finalizeOptions(options));
    });
  },

  neighbor() {
    const catLine = sceneText("neighbor");
    showDialogue([
      { speaker: "RAY", text: "My downstairs neighbor knocks at 6pm. She looks like she has not slept." },
      { speaker: "NEIGHBOR", text: "\"The cat. It cries at 5am. Every day this week.\"" },
      { speaker: "RAY", text: `I've been getting home at 2am and sleeping through it. She has not. ${catLine} Something has to change.` }
    ], () => {
      const options = [
        { label: "Apologize and buy a calming diffuser", action: () => { adjustTrust(6); state.choices.neighbor = "diffuser"; logEvent("Neighbor: You bought a calming diffuser."); goToScene("gig_conflict"); } },
        { label: "Ask her to stop feeding it from her window", action: () => { adjustTrust(-1); state.choices.neighbor = "ask_stop"; logEvent("Neighbor: You asked her to stop feeding it."); goToScene("gig_conflict"); } },
        { label: "Offer to let her help find it a home", action: () => { adjustTrust(-4); state.choices.neighbor = "rehome"; logEvent("Neighbor: You considered rehoming it."); goToScene("gig_conflict"); } }
      ];
      if (catTag("Wallflower")) {
        options.push({ label: "Explain it only cries when it cannot find a hiding spot", action: () => { adjustTrust(8); state.choices.neighbor = "explain"; logEvent("Neighbor: You explained its hiding habit."); goToScene("gig_conflict"); } });
      }
      if (catTag("Bottomless Pit")) {
        options.push({ label: "Promise a bigger midnight feeding so it sleeps in", action: () => { adjustTrust(7); state.choices.neighbor = "midnight"; logEvent("Neighbor: You promised a midnight meal."); goToScene("gig_conflict"); } });
      }
      showChoices(finalizeOptions(options));
    });
  },

  gig_conflict() {
    const catLine = sceneText("gig_conflict");
    showDialogue([
      { speaker: "RAY", text: "A last-minute weekend gig. Good money, good venue, good for my name. Three days away from home." },
      { speaker: "RAY", text: `The cat has started sleeping at the foot of the bed instead of under it. ${catLine}` }
    ], () => {
      const options = [
        { label: "Take the gig — it's a real step forward", action: () => { adjustTrust(-4); state.choices.gig = "take"; logEvent("Gig conflict: You took the gig."); goToScene("recording_trip"); } },
        { label: "Find a paid sitter and call every night", action: () => { adjustTrust(8); state.choices.gig = "sitter"; logEvent("Gig conflict: You hired a sitter."); goToScene("recording_trip"); } },
        { label: "Ask a bandmate to house-sit", action: () => { adjustTrust(5); state.choices.gig = "bandmate"; logEvent("Gig conflict: A bandmate house-sat."); goToScene("recording_trip"); } }
      ];
      if (catTag("Velcro Cat")) {
        options.push({ label: "Turn down the gig. It would be too quiet without it.", action: () => { adjustTrust(14); state.choices.gig = "decline"; logEvent("Gig conflict: You declined the gig."); goToScene("recording_trip"); } });
      }
      if (catTag("CEO of the Household")) {
        options.push({ label: "Let the sitter follow a strict schedule it seems to prefer", action: () => { adjustTrust(9); state.choices.gig = "schedule"; logEvent("Gig conflict: You left a schedule."); goToScene("recording_trip"); } });
      }
      showChoices(finalizeOptions(options));
    });
  },

  recording_trip() {
    const catLine = sceneText("recording_trip");
    showDialogue([
      { speaker: "RAY", text: "The label wants me in another city for two weeks to record. This is everything I worked for. The cat is not invited." },
      { speaker: "RAY", text: `${catLine} Every arrangement I consider feels like a small betrayal of something I didn't know I'd signed up for.` }
    ], () => {
      const options = [
        { label: "Go. This is the contract.", action: () => { adjustTrust(-8); state.choices.recording = "go"; logEvent("Recording trip: You went to the other city."); goToScene("quiet_night"); } },
        { label: "Negotiate a local studio instead", action: () => { adjustTrust(10); state.choices.recording = "local"; logEvent("Recording trip: You negotiated local recording."); goToScene("quiet_night"); } },
        { label: "Bring the cat. Find a pet-friendly rental.", action: () => { adjustTrust(14); state.choices.recording = "bring"; logEvent("Recording trip: You brought the cat."); goToScene("quiet_night"); } }
      ];
      if (catTag("Sphynx")) {
        options.push({ label: "Book the rental. A hairless cat in a cold studio needs you.", action: () => { adjustTrust(16); state.choices.recording = "bring"; logEvent("Recording trip: You brought the Sphynx."); goToScene("quiet_night"); } });
      }
      if (catTag("Little Gremlin")) {
        options.push({ label: "Leave it with three new toys and a camera to check in", action: () => { adjustTrust(11); state.choices.recording = "toys"; logEvent("Recording trip: You left toys and a camera."); goToScene("quiet_night"); } });
      }
      showChoices(finalizeOptions(options));
    });
  },

  quiet_night() {
    const catLine = sceneText("quiet_night");
    showDialogue([
      { speaker: "RAY", text: "For the first time in months, I have a night off. No gig. No call. No deadline." },
      { speaker: "RAY", text: `${catLine} The city is quiet outside. I could practice. I could rest. I could just sit there.` }
    ], () => {
      const options = [
        { label: "Practice the new piece", action: () => { adjustTrust(5); state.choices.quiet = "practice"; logEvent("Quiet night: You practiced."); goToScene("ending"); } },
        { label: "Rest on the couch", action: () => { adjustTrust(8); state.choices.quiet = "rest"; logEvent("Quiet night: You rested."); goToScene("ending"); } },
        { label: "Sit with the cat and do nothing", action: () => { adjustTrust(12); state.choices.quiet = "sit"; logEvent("Quiet night: You sat with the cat."); goToScene("ending"); } }
      ];
      if (catTag("Professional Napper")) {
        options.push({ label: "Nap on the couch so it can sleep on your chest", action: () => { adjustTrust(14); state.choices.quiet = "nap_together"; logEvent("Quiet night: You napped together."); goToScene("ending"); } });
      }
      if (catTag("Tiny Detective")) {
        options.push({ label: "Play a slow song while it investigates the sheet music", action: () => { adjustTrust(13); state.choices.quiet = "detective"; logEvent("Quiet night: You played while it investigated."); goToScene("ending"); } });
      }
      showChoices(finalizeOptions(options));
    });
  },

  ending() {
    const { choices, trust, cat } = state;
    let endingKey = "";

    // Six endings, split so the mid trust range isn't one-size-fits-all
    if (trust >= 75 && choices.recording !== "go") {
      endingKey = "permanent_resident";
    } else if (trust >= 60 && choices.recording === "go") {
      endingKey = "album_dedication";
    } else if (trust >= 45 && trust < 75) {
      endingKey = "roommate";
    } else if (trust <= 20 && choices.act1 === "shoo") {
      endingKey = "reassigned";
    } else if (trust <= 30) {
      endingKey = "free_spirit";
    } else {
      endingKey = "mutual_captivity";
    }

    state.endingKey = endingKey;

    const endings = {
      permanent_resident: {
        title: "Permanent Resident",
        emoji: "🐱",
        text:
          "You missed one studio session. You moved the cat off the keyboard every morning. You went to the vet at 3am. " +
          "You turned down the two-week trip and negotiated a local recording instead.\n\n" +
          "Somewhere in there, the negotiation ended. The cat sleeps on the piano bench now. " +
          "You write better music than you used to. You are not sure if those two things are connected.\n\n" +
          "They are.",
        subtitle: "Trust broke the stalemate."
      },
      roommate: {
        title: "The Roommate",
        emoji: "🛋️",
        text:
          "You share the apartment. It sleeps on the couch, not your lap. It eats what you put out, but it would probably be fine without you. " +
          "You call it by the name your neighbor suggested, but only sometimes.\n\n" +
          "It's not love, exactly. But you both keep showing up.",
        subtitle: "A working arrangement."
      },
      free_spirit: {
        title: "Free Spirit",
        emoji: "🌙",
        text:
          "You kept your schedule, it kept its distance. It shows up after your late sets, eats, sits near the window for a while, then disappears until the next night.\n\n" +
          "Not quite yours. Not quite gone. The city has a lot of alleys. You are just one of its stops.\n\n" +
          "That is okay.",
        subtitle: "Some things aren't meant to be kept."
      },
      album_dedication: {
        title: "The Album Dedication",
        emoji: "🎶",
        text:
          "You got the contract. Recorded the album. Built the career. The cat was gone by the time you came back from the recording trip.\n\n" +
          "But the album sounds different from anything you made before — warmer, a little melancholy. You dedicated it to no one in particular.\n\n" +
          "You know who it is for.",
        subtitle: "Trust survived the distance."
      },
      reassigned: {
        title: "Reassigned",
        emoji: "🏠",
        text:
          "Your downstairs neighbor has been leaving food out since week two. Better hours, ground floor access, a quieter human.\n\n" +
          "The cat made a completely rational decision. You see it sometimes through her window when you come home late. It looks comfortable.\n\n" +
          "You cannot argue with that.",
        subtitle: "You were outbid."
      },
      mutual_captivity: {
        title: "Mutual Captivity",
        emoji: "😾",
        text:
          "Neither of you planned this. Neither of you is leaving. It glares at you from the piano bench. You glare at it from your desk. " +
          "You have both accepted this is just the arrangement now.\n\n" +
          "Last week you wrote a song about it. It was the best thing you have ever made.",
        subtitle: "No one is happy. No one is leaving."
      }
    };

    const end = endings[endingKey];
    const trustLabel = trust >= 75 ? "High" : trust >= 50 ? "Moderate" : trust >= 30 ? "Low" : "Very low";
    showDialogue([
      { speaker: "—", text: `${end.emoji}  ${end.title.toUpperCase()}` },
      { speaker: "—", text: end.subtitle },
      { speaker: "RAY", text: end.text },
      { speaker: "—", text: `Final trust · ${trust}/100 (${trustLabel})\n${cat.breed.name} · ${cat.personality.name}` }
    ], () => {
      logEvent(`Ending: ${end.title} (trust ${trust})`);
      saveUnlock(cat.breed.name);
      dom.restart.classList.remove("hidden");
      dom.toggleLog.classList.remove("hidden");
      // Restart from an ending always returns to the breed-select gallery.
      state.scene = "breed_select";
      saveGame();
    });
  }
};

/* ---------------- INIT ---------------- */

dom.restart.addEventListener("click", () => {
  if (state.scene === "breed_select") {
    returnToBreedSelect();
  } else {
    clearSave();
    goToScene("breed_select");
  }
});

dom.toggleLog.addEventListener("click", () => {
  dom.log.classList.toggle("hidden");
});

const bgMusic = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");
let musicPlaying = false;
let musicStarted = false;

function setMusicIcon(playing) {
  if (!musicToggle) return;
  musicToggle.textContent = playing ? "♫" : "♪";
  musicToggle.classList.toggle("playing", playing);
}

function tryPlayMusic() {
  if (!bgMusic || musicPlaying) return;
  bgMusic.play().then(() => {
    musicPlaying = true;
    musicStarted = true;
    setMusicIcon(true);
  }).catch(() => {
    // Browser blocked autoplay — wait for interaction
  });
}

function pauseMusic() {
  if (!bgMusic) return;
  bgMusic.pause();
  musicPlaying = false;
  setMusicIcon(false);
}

if (musicToggle && bgMusic) {
  bgMusic.volume = 0.35;

  // Try to start as soon as the audio is ready
  bgMusic.addEventListener("canplaythrough", tryPlayMusic);
  bgMusic.load();

  // Also try immediately (works if browser allows autoplay)
  tryPlayMusic();

  // Start on first user interaction anywhere
  const startOnInteraction = () => {
    tryPlayMusic();
    document.removeEventListener("click", startOnInteraction);
    document.removeEventListener("keydown", startOnInteraction);
    document.removeEventListener("touchstart", startOnInteraction);
  };
  document.addEventListener("click", startOnInteraction);
  document.addEventListener("keydown", startOnInteraction);
  document.addEventListener("touchstart", startOnInteraction);

  // Toggle button
  musicToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (musicPlaying) {
      pauseMusic();
    } else {
      tryPlayMusic();
    }
  });
}

function boot() {
  const saved = loadGame();
  if (saved) {
    Object.assign(state, saved);
    state.unlockedBreeds = loadUnlocks();
    const revealed = state.cat && state.cat.breed;
    if (revealed) updateCatCard(); else dom.catInfo.classList.add("hidden");
    saved.log.forEach(entry => {
      const li = document.createElement("li");
      li.textContent = entry;
      dom.logList.appendChild(li);
    });
    showPassage(
      "Welcome back.",
      "RAY",
      () => {
        showDialogue([
          { speaker: "RAY", text: revealed
            ? `I was last in: ${state.scene.replace(/_/g, " ")}. The ${state.cat.breed.name.toLowerCase()} is ${state.cat.personality.name.toLowerCase()}. Trust is at ${state.trust}/100.`
            : "I was in the apartment. Five shapes in the dark." }
        ], () => {
          showChoices([
            { label: "Continue where you left off", action: () => goToScene(state.scene) },
            { label: "Choose a different cat", action: () => { clearSave(); goToScene("breed_select"); } }
          ]);
        });
      }
    );
    if (window.renderScene) window.renderScene(state.scene, state);
  } else {
    goToScene("breed_select");
  }
}

// Start the game
boot();
