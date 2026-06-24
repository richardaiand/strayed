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

const SAVE_KEY = "strayed_save_v1";

const state = {
  cat: null,
  trust: 10,
  scene: "start",
  choices: {},
  log: [],
  awaitingInput: false,
  freeInputTarget: null
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
    if (!saved || !saved.scene || saved.scene === "start") return null;
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
  catEmoji: document.getElementById("cat-emoji"),
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
  toggleLog: document.getElementById("toggle-log")
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

function generateCat() {
  const seed = Date.now() + Math.floor(Math.random() * 10000);
  const rng = seededRandom(seed);
  const social = SOCIAL_STYLES[Math.floor(rng() * SOCIAL_STYLES.length)];
  const drive = CORE_DRIVES[Math.floor(rng() * CORE_DRIVES.length)];
  const breed = BREEDS[Math.floor(rng() * BREEDS.length)];
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
  dom.catEmoji.textContent = state.cat.personality.emoji || state.cat.breed.emoji;
  dom.catName.textContent = state.cat.name === "the cat" ? "the cat" : state.cat.name;
  dom.catBreed.textContent = `${state.cat.breed.name} · ${state.cat.gender}`;
  dom.catPersonality.textContent = `${state.cat.personality.name} (${state.cat.social} + ${state.cat.drive})`;
  updateTrustBar();
}

function updateTrustBar() {
  const pct = Math.max(0, Math.min(100, state.trust));
  dom.trustFill.style.width = `${pct}%`;
  let label = "uncertain";
  if (pct < 20) label = "wary";
  else if (pct < 40) label = "curious";
  else if (pct < 60) label = "settling in";
  else if (pct < 80) label = "attached";
  else label = "yours";
  dom.trustLabel.textContent = `trust: ${label}`;
}

function adjustTrust(delta) {
  state.trust = Math.max(0, Math.min(100, state.trust + delta));
  updateTrustBar();
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

    let trustDelta = 0;
    if (tone === "gentle") trustDelta = 5;
    if (tone === "playful") trustDelta = 3;
    if (tone === "impatient") trustDelta = -4;
    if (tone === "distracted") trustDelta = -2;
    if (state.cat.social === "Tsundere" && tone === "gentle") trustDelta += 2;
    if (state.cat.social === "Wallflower" && tone === "impatient") trustDelta -= 3;
    adjustTrust(trustDelta);

    onSubmit({ text, tone, reaction, trustDelta });
  };

  dom.submitText.onclick = handler;
  dom.playerText.onkeydown = (e) => {
    if (e.key === "Enter") handler();
  };
}

function goToScene(sceneName) {
  state.scene = sceneName;
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
  start() {
    state.cat = generateCat();
    state.trust = 10;
    state.choices = {};
    state.log = [];
    dom.logList.innerHTML = "";
    dom.restart.classList.add("hidden");
    dom.toggleLog.classList.add("hidden");
    dom.log.classList.add("hidden");
    dom.catInfo.classList.add("hidden");

    showDialogue([
      { speaker: "RAY", text: "The gig is over. The club has emptied out, and the alley behind it smells like rain that never came. My fingers are still warm from the keys. My shoulders are not." },
      { speaker: "RAY", text: "There's something sitting beside my instrument case. A cat. Motionless. Watching me with the calm of something that has already made a decision." },
      { speaker: "RAY", text: "I have a 10am call with a record label tomorrow. I do not have room for this." }
    ], () => {
      showChoices([
        { label: "Let it in for just one night", action: () => { adjustTrust(8); state.choices.act1 = "let_in"; logEvent("Act 1: You let the cat in for one night."); goToScene("act1_morning"); } },
        { label: "Leave water outside and go to bed", action: () => { adjustTrust(2); state.choices.act1 = "water"; logEvent("Act 1: You left water outside."); goToScene("act1_morning"); } },
        { label: "Try to shoo it away", action: () => { adjustTrust(-6); state.choices.act1 = "shoo"; logEvent("Act 1: You tried to shoo the cat away."); goToScene("act1_morning"); } }
      ]);
    });
  },

  act1_morning() {
    updateCatCard();
    const reaction = state.choices.act1 === "let_in"
      ? "It slept under the radiator and was gone before sunrise."
      : state.choices.act1 === "water"
        ? "The bowl was empty when I woke. The cat was not."
        : "It let me close the door. Then it sat outside it all night.";

    showDialogue([
      { speaker: "RAY", text: `Morning comes too early. ${reaction}` },
      { speaker: "RAY", text: "The label call goes better than I expected. They want to hear more. They want to see me. I hang up and notice the scratches on my door, the empty windowsill, the silence that is somehow louder than it used to be." },
      { speaker: "RAY", text: "That evening, the cat is back. Same spot. Same look. It is not asking permission." },
      { speaker: "RAY", text: `It is a ${state.cat.breed.name}. ${state.cat.breed.blurb}` },
      { speaker: "RAY", text: `And it is ${state.cat.personality.name.toLowerCase()}. ${state.cat.personality.description}` }
    ], () => {
      offerFreeInput(
        "It is looking at you. Say something to the cat.",
        "act1_greeting",
        () => {
          showDialogue([
            { speaker: "RAY", text: "I said what I said. The cat heard it. Whether that means anything is still up for debate." },
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
    showDialogue([
      { speaker: "RAY", text: "I'm running a home practice session. My bandmate is on the call, half-listening, half-texting. I find the groove of a new piece — something slower, something that might be good — and then the cat walks across my keyboard." },
      { speaker: "RAY", text: "The chord it plays does not exist in any theory book. My bandmate loses it. The cat looks pleased, or possibly bored. It is hard to tell." }
    ], () => {
      showChoices([
        { label: "Laugh it off and keep the take", action: () => { adjustTrust(6); state.choices.rehearsal = "laugh"; logEvent("Rehearsal: You laughed it off."); goToScene("label_call"); } },
        { label: "Lock the cat out of the room from now on", action: () => { adjustTrust(-8); state.choices.rehearsal = "lock"; logEvent("Rehearsal: You locked the cat out."); goToScene("label_call"); } },
        { label: "Try to compose around the chord", action: () => { adjustTrust(4); state.choices.rehearsal = "compose"; logEvent("Rehearsal: You composed around the cat's chord."); goToScene("label_call"); } }
      ]);
    });
  },

  label_call() {
    showDialogue([
      { speaker: "RAY", text: "The A&R rep. The big one. The one who actually signs people. I put on a clean shirt and angle the lamp so the apartment looks like somewhere an adult lives." },
      { speaker: "RAY", text: "Five minutes in, the cat jumps onto the desk. It sits directly in front of the camera. It stares into the lens with the authority of someone who has reviewed my contract and found it wanting." }
    ], () => {
      showChoices([
        { label: "Introduce it to the rep", action: () => { adjustTrust(7); state.choices.labelCall = "introduce"; logEvent("Label call: You introduced the cat."); goToScene("emergency"); } },
        { label: "Move it off the desk gently", action: () => { adjustTrust(1); state.choices.labelCall = "move"; logEvent("Label call: You moved the cat off the desk."); goToScene("emergency"); } },
        { label: "Pretend nothing is happening", action: () => { adjustTrust(-3); state.choices.labelCall = "ignore"; logEvent("Label call: You pretended nothing was happening."); goToScene("emergency"); } }
      ]);
    });
  },

  emergency() {
    showDialogue([
      { speaker: "RAY", text: "3am. The cat is not eating. It is not moving much. Something is wrong in the way wrong things are wrong before you have words for them." },
      { speaker: "RAY", text: "The all-night vet is forty minutes away. I have a studio session at 8am with a producer flying in from out of town. I cannot reschedule. I cannot do both perfectly." }
    ], () => {
      showChoices([
        { label: "Take it to the vet and risk the session", action: () => { adjustTrust(12); state.choices.emergency = "vet"; logEvent("Emergency: You went to the vet."); goToScene("neighbor"); } },
        { label: "Call the vet for advice and go to the session", action: () => { adjustTrust(2); state.choices.emergency = "call"; logEvent("Emergency: You called the vet for advice."); goToScene("neighbor"); } },
        { label: "Go to the session; the cat will probably be fine", action: () => { adjustTrust(-10); state.choices.emergency = "session"; logEvent("Emergency: You went to the session."); goToScene("neighbor"); } }
      ]);
    });
  },

  neighbor() {
    showDialogue([
      { speaker: "RAY", text: "My downstairs neighbor knocks at 6pm. She looks like she has not slept." },
      { speaker: "NEIGHBOR", text: "\"The cat. It cries at 5am. Every day this week.\"" },
      { speaker: "RAY", text: "I've been getting home at 2am and sleeping through it. She has not. The cat, audibly, is also not happy. Something has to change." }
    ], () => {
      showChoices([
        { label: "Apologize and buy a calming diffuser", action: () => { adjustTrust(3); state.choices.neighbor = "diffuser"; logEvent("Neighbor: You bought a calming diffuser."); goToScene("gig_conflict"); } },
        { label: "Ask her to stop feeding it from her window", action: () => { adjustTrust(-2); state.choices.neighbor = "ask_stop"; logEvent("Neighbor: You asked her to stop feeding it."); goToScene("gig_conflict"); } },
        { label: "Offer to let her help find it a home", action: () => { adjustTrust(-5); state.choices.neighbor = "rehome"; logEvent("Neighbor: You considered rehoming it."); goToScene("gig_conflict"); } }
      ]);
    });
  },

  gig_conflict() {
    showDialogue([
      { speaker: "RAY", text: "A last-minute weekend gig. Good money, good venue, good for my name. Three days away from home." },
      { speaker: "RAY", text: "The cat has just started sleeping near me instead of under the bed. I can see the difference in the shape of its body when I enter the room. It is a small thing. It is not a small thing." }
    ], () => {
      showChoices([
        { label: "Take the gig", action: () => { adjustTrust(-6); state.choices.gig = "take"; logEvent("Gig conflict: You took the gig."); goToScene("recording_trip"); } },
        { label: "Find a paid sitter and stay connected", action: () => { adjustTrust(4); state.choices.gig = "sitter"; logEvent("Gig conflict: You hired a sitter."); goToScene("recording_trip"); } },
        { label: "Ask a bandmate to house-sit", action: () => { adjustTrust(2); state.choices.gig = "bandmate"; logEvent("Gig conflict: A bandmate house-sat."); goToScene("recording_trip"); } }
      ]);
    });
  },

  recording_trip() {
    showDialogue([
      { speaker: "RAY", text: "The label wants me in another city for two weeks to record. This is everything I worked for. The cat is not invited." },
      { speaker: "RAY", text: "Every arrangement I consider feels like a small betrayal of something I didn't know I'd signed up for." }
    ], () => {
      showChoices([
        { label: "Go. This is the contract.", action: () => { adjustTrust(-10); state.choices.recording = "go"; logEvent("Recording trip: You went to the other city."); goToScene("quiet_night"); } },
        { label: "Negotiate a local studio instead", action: () => { adjustTrust(6); state.choices.recording = "local"; logEvent("Recording trip: You negotiated local recording."); goToScene("quiet_night"); } },
        { label: "Bring the cat. Find a pet-friendly rental.", action: () => { adjustTrust(8); state.choices.recording = "bring"; logEvent("Recording trip: You brought the cat."); goToScene("quiet_night"); } }
      ]);
    });
  },

  quiet_night() {
    showDialogue([
      { speaker: "RAY", text: "For the first time in months, I have a night off. No gig. No call. No deadline." },
      { speaker: "RAY", text: "The cat is in the room. The city is quiet outside. I could practice. I could rest. I could just sit there." }
    ], () => {
      showChoices([
        { label: "Practice the new piece", action: () => { adjustTrust(3); state.choices.quiet = "practice"; logEvent("Quiet night: You practiced."); goToScene("ending"); } },
        { label: "Rest on the couch", action: () => { adjustTrust(5); state.choices.quiet = "rest"; logEvent("Quiet night: You rested."); goToScene("ending"); } },
        { label: "Sit with the cat and do nothing", action: () => { adjustTrust(7); state.choices.quiet = "sit"; logEvent("Quiet night: You sat with the cat."); goToScene("ending"); } }
      ]);
    });
  },

  ending() {
    const { choices, trust, cat } = state;
    let endingKey = "";

    if (trust >= 75 && choices.recording !== "go") {
      endingKey = "permanent_resident";
    } else if (trust <= 25 && choices.act1 === "shoo") {
      endingKey = "reassigned";
    } else if (trust >= 60 && choices.recording === "go") {
      endingKey = "album_dedication";
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
          "They are."
      },
      free_spirit: {
        title: "Free Spirit",
        emoji: "🌙",
        text:
          "You kept your schedule, it kept its distance. It shows up after your late sets, eats, sits near the window for a while, then disappears until the next night.\n\n" +
          "Not quite yours. Not quite gone. The city has a lot of alleys. You are just one of its stops.\n\n" +
          "That is okay."
      },
      album_dedication: {
        title: "The Album Dedication",
        emoji: "🎶",
        text:
          "You got the contract. Recorded the album. Built the career. The cat was gone by the time you came back from the recording trip.\n\n" +
          "But the album sounds different from anything you made before — warmer, a little melancholy. You dedicated it to no one in particular.\n\n" +
          "You know who it is for."
      },
      reassigned: {
        title: "Reassigned",
        emoji: "🏠",
        text:
          "Your downstairs neighbor has been leaving food out since week two. Better hours, ground floor access, a quieter human.\n\n" +
          "The cat made a completely rational decision. You see it sometimes through her window when you come home late. It looks comfortable.\n\n" +
          "You cannot argue with that."
      },
      mutual_captivity: {
        title: "Mutual Captivity",
        emoji: "😾",
        text:
          "Neither of you planned this. Neither of you is leaving. It glares at you from the piano bench. You glare at it from your desk. " +
          "You have both accepted this is just the arrangement now.\n\n" +
          "Last week you wrote a song about it. It was the best thing you have ever made."
      }
    };

    const end = endings[endingKey];
    showDialogue([
      { speaker: "—", text: `${end.emoji}  ${end.title.toUpperCase()}` },
      { speaker: "RAY", text: end.text },
      { speaker: "—", text: `Final trust: ${trust}/100 · ${cat.breed.name} · ${cat.personality.name}` }
    ], () => {
      logEvent(`Ending: ${end.title} (trust ${trust})`);
      dom.restart.classList.remove("hidden");
      dom.toggleLog.classList.remove("hidden");
    });
  }
};

/* ---------------- INIT ---------------- */

dom.restart.addEventListener("click", () => {
  clearSave();
  goToScene("start");
});

dom.toggleLog.addEventListener("click", () => {
  dom.log.classList.toggle("hidden");
});

const bgMusic = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");
let musicPlaying = false;
let musicManuallyControlled = false;

function startMusic() {
  if (musicPlaying || !bgMusic) return;
  bgMusic.play().then(() => {
    musicPlaying = true;
    if (musicToggle) {
      musicToggle.textContent = "♫";
      musicToggle.classList.add("playing");
    }
  }).catch(() => {
    // Autoplay blocked — will retry on first user interaction
  });
}

if (musicToggle && bgMusic) {
  bgMusic.volume = 0.35;
  // Try autoplay immediately
  startMusic();
  // Browsers block autoplay until interaction — start on first click/keypress
  const startOnce = () => {
    if (!musicManuallyControlled) startMusic();
    document.removeEventListener("click", startOnce);
    document.removeEventListener("keydown", startOnce);
  };
  document.addEventListener("click", startOnce);
  document.addEventListener("keydown", startOnce);

  musicToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    musicManuallyControlled = true;
    document.removeEventListener("click", startOnce);
    document.removeEventListener("keydown", startOnce);
    if (musicPlaying) {
      bgMusic.pause();
      musicToggle.textContent = "♪";
      musicToggle.classList.remove("playing");
    } else {
      bgMusic.play().catch(() => {});
      musicToggle.textContent = "♫";
      musicToggle.classList.add("playing");
    }
    musicPlaying = !musicPlaying;
  });
}

function boot() {
  const saved = loadGame();
  if (saved) {
    Object.assign(state, saved);
    const revealed = state.scene !== "start";
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
            : "I was in the alley. The cat was still just a shape in the dark." }
        ], () => {
          showChoices([
            { label: "Continue where you left off", action: () => goToScene(state.scene) },
            { label: "Start a new game", action: () => { clearSave(); goToScene("start"); } }
          ]);
        });
      }
    );
    if (window.renderScene) window.renderScene(state.scene, state);
  } else {
    goToScene("start");
  }
}

// Start the game
boot();
