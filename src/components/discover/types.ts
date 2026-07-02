// ─── Helpers ─────────────────────────────────────────────────────
export function shade(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (n >> 16) - 30);
  const g = Math.max(0, ((n >> 8) & 255) - 26);
  const b = Math.max(0, (n & 255) - 22);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

export function toneWord(p: number): string {
  return p >= 75 ? 'a real strength' : p >= 55 ? 'solid' : p >= 35 ? 'developing' : 'room to grow';
}

// ─── Types ───────────────────────────────────────────────────────
export interface TestItem { q: string; d: string }
export interface PairOption { label: string; v: string }
export interface PictureOption { label: string; ic: string; tone: number; c1: string; c2: string }
export interface TypeInfo {
  desc: string; tag: string; tip?: string;
  a?: { label: string; text: string };
  b?: { label: string; text: string };
}
export interface TestDef {
  title: string; accent: string; icon: string; blurb: string; kind: string; tag?: string;
  intro?: string; items?: TestItem[]; topN?: number; card?: boolean; cardLabel?: string;
  reveal?: string; overall?: boolean; archetype?: boolean;
  types?: Record<string, TypeInfo>;
  pairs?: PairOption[][];
  options?: PictureOption[];
  scale?: [string, number][];
}
export interface SavedResult { t: number; summary: string; scores?: Record<string, number>; top?: string[]; tone?: number; label?: string; aiFeedback?: { headline: string; narrative: string; tip: string; insights?: string[] } }

// ─── Test Data ──────────────────────────────────────────────────
export const TESTS: Record<string, TestDef> = {
  phq9: { 
    title: "PHQ-9 screening", 
    accent: "#50718F", 
    icon: "clipboard", 
    blurb: "A five-question baseline health questionnaire to screen and monitor your wellness levels.", 
    kind: "profile", 
    overall: true, 
    tag: "Self-check · 2 min", 
    intro: "Over the last two weeks, how often have you been bothered by any of the following problems?", 
    items: [
      { q: "Little interest or pleasure in doing things?", d: "Interest" }, 
      { q: "Feeling down, depressed, or hopeless?", d: "Mood" }, 
      { q: "Trouble falling or staying asleep, or sleeping too much?", d: "Sleep" }, 
      { q: "Feeling tired or having little energy?", d: "Energy" }, 
      { q: "Poor appetite or overeating?", d: "Appetite" }
    ],
    scale: [
      ["Not at all", 0],
      ["Several days", 1],
      ["More than half the days", 2],
      ["Nearly every day", 3]
    ]
  },
  checkin: { 
    title: "Emotional check-in", 
    accent: "#7A5B93", // Styled in plum theme
    icon: "heart", 
    blurb: "A two-minute snapshot. See how you’re really doing, and watch it shift over the weeks.", 
    kind: "profile", 
    overall: true, 
    tag: "Wellbeing · 2 min", 
    intro: "Over the last two weeks…", 
    items: [
      { q: "I have felt cheerful and in good spirits.", d: "Good spirits" }, 
      { q: "I have felt calm and relaxed.", d: "Calm" }, 
      { q: "I have felt active and energetic.", d: "Energy" }, 
      { q: "I woke up feeling fresh and rested.", d: "Rested" }, 
      { q: "My daily life has been filled with things that interest me.", d: "Engaged" }, 
      { q: "I have felt connected to people around me.", d: "Connection" }
    ] 
  },
  mood: { 
    title: "Mood snapshot", 
    accent: "#AD6A82", // Styled in rose/plum theme
    icon: "cloud", 
    blurb: "A one-tap picture check. Fast, honest, and it adds a tile to your moodboard.", 
    kind: "picture", 
    tag: "Quick · 15 sec", 
    options: [
      { label: "Bright", ic: "spark", tone: 88, c1: "#e3b04b", c2: "#7c9473" }, 
      { label: "Steady", ic: "compass", tone: 64, c1: "#7c9473", c2: "#3D6E66" }, 
      { label: "Tangled", ic: "bloom", tone: 40, c1: "#d4a24a", c2: "#c97b3f" }, 
      { label: "Heavy", ic: "cloud", tone: 20, c1: "#8a93b0", c2: "#6f7aa0" }, 
      { label: "Tender", ic: "heart", tone: 48, c1: "#AD6A82", c2: "#7A5B93" }, 
      { label: "Wired", ic: "star", tone: 55, c1: "#d97706", c2: "#AD6A82" }
    ] 
  },
  strengths: { 
    title: "Signature strengths", 
    accent: "#C99452", // Styled in gold/brand theme
    icon: "star", 
    blurb: "Your top five character strengths: the qualities you lead with, on a card made to share.", 
    kind: "rank", 
    topN: 5, 
    tag: "Strengths · 2 min", 
    intro: "How much is this like you?", 
    items: [
      { q: "I love exploring new ideas just to see where they lead.", d: "Curiosity" }, 
      { q: "I often come up with original or inventive ways to do things.", d: "Creativity" }, 
      { q: "I keep going even when something gets hard or boring.", d: "Perseverance" }, 
      { q: "I go out of my way to help people, even in small ways.", d: "Kindness" }, 
      { q: "People tend to look to me to organise or take the lead.", d: "Leadership" }, 
      { q: "I treat everyone fairly, even people I don’t know well.", d: "Fairness" }, 
      { q: "I like making people laugh and lightening the mood.", d: "Humour" }, 
      { q: "I’ll speak up or act even when it feels a bit scary.", d: "Bravery" }, 
      { q: "I genuinely enjoy learning new things for their own sake.", d: "Love of learning" }, 
      { q: "I notice and appreciate the good things in my life.", d: "Gratitude" }, 
      { q: "I work well with others and like being part of a team.", d: "Teamwork" }, 
      { q: "I stay hopeful that things will work out in the end.", d: "Hope" }
    ] 
  },
  bigfive: { 
    title: "Personality profile", 
    accent: "#50718F", // Styled in sky/blue theme
    icon: "compass", 
    blurb: "Five core traits that add up to an archetype that’s unmistakably you.", 
    kind: "profile", 
    archetype: true, 
    tag: "Identity · 2 min", 
    intro: "How well does this describe you?", 
    items: [
      { q: "I love trying new experiences and ideas.", d: "Openness" }, 
      { q: "I have a vivid imagination and enjoy abstract thinking.", d: "Openness" }, 
      { q: "I get things done and like to be organised.", d: "Conscientiousness" }, 
      { q: "I follow through on what I plan to do.", d: "Conscientiousness" }, 
      { q: "I feel energised around other people.", d: "Extraversion" }, 
      { q: "I start conversations and enjoy being social.", d: "Extraversion" }, 
      { q: "I’m considerate and care about others’ feelings.", d: "Warmth" }, 
      { q: "I trust people and assume the best in them.", d: "Warmth" }, 
      { q: "I stay calm and steady under pressure.", d: "Steadiness" }, 
      { q: "I rarely let small setbacks rattle me.", d: "Steadiness" }
    ] 
  },
  values: { 
    title: "What matters most", 
    accent: "#7A5B93", 
    icon: "scale", 
    blurb: "A quick this-or-that that reveals the values you quietly lead with.", 
    kind: "pairs", 
    tag: "Values · 90 sec", 
    pairs: [
      [{ label: "A surprising adventure", v: "Adventure" }, { label: "A safe, settled plan", v: "Security" }], 
      [{ label: "Deep time with one friend", v: "Connection" }, { label: "Winning at something hard", v: "Achievement" }], 
      [{ label: "Total freedom to choose", v: "Freedom" }, { label: "Learning and growing", v: "Growth" }], 
      [{ label: "Trying something risky", v: "Adventure" }, { label: "Helping someone you love", v: "Connection" }], 
      [{ label: "Being recognised for your work", v: "Achievement" }, { label: "A calm, secure week", v: "Security" }], 
      [{ label: "Mastering a new skill", v: "Growth" }, { label: "Doing it your own way", v: "Freedom" }], 
      [{ label: "A loyal close circle", v: "Connection" }, { label: "An open road, no plan", v: "Adventure" }], 
      [{ label: "Becoming wiser", v: "Growth" }, { label: "Achieving a big goal", v: "Achievement" }]
    ] 
  },
  strengthshadow: { 
    title: "Strength & shadow", 
    accent: "#7A5B93", 
    icon: "shield", 
    blurb: "Your greatest strength and its flip side: usually the same trait, turned up.", 
    kind: "type", 
    card: true, 
    cardLabel: "My core strength", 
    reveal: "You’re", 
    tag: "Insight · 2 min", 
    intro: "How much is this like you?", 
    items: [
      { q: "I deeply feel what the people around me are feeling.", d: "The Empath" }, 
      { q: "I notice straight away when someone’s a bit off.", d: "The Empath" }, 
      { q: "I push hard to reach the goals I set.", d: "The Achiever" }, 
      { q: "I’m driven to accomplish and make progress.", d: "The Achiever" }, 
      { q: "I like doing things my own way, on my own terms.", d: "The Free Spirit" }, 
      { q: "I resist being boxed in by rules or routine.", d: "The Free Spirit" }, 
      { q: "I work hard to keep everyone around me happy.", d: "The Peacemaker" }, 
      { q: "I’ll smooth things over to avoid conflict.", d: "The Peacemaker" }
    ], 
    types: { 
      "The Empath": { 
        desc: "You feel the room and make people feel understood. That same depth is also your edge.", 
        tag: "Feels everything", 
        a: { label: "Your strength", text: "Deep empathy: people feel genuinely seen and safe with you." }, 
        b: { label: "Your shadow", text: "You absorb other people’s stress and can lose track of your own needs." }, 
        tip: "You can care deeply without carrying it all. Protect your own energy on purpose." 
      }, 
      "The Achiever": { 
        desc: "You make things happen. The drive that powers you can also run you into the ground.", 
        tag: "Driven to do", 
        a: { label: "Your strength", text: "Real drive and follow-through: you turn intentions into results." }, 
        b: { label: "Your shadow", text: "You can tie your worth to output, and rest can start to feel like failure." }, 
        tip: "You’re enough on the days you achieve nothing. Schedule rest like it’s a deadline." 
      }, 
      "The Free Spirit": { 
        desc: "You’re authentic and independent. The independence that frees you can also isolate you.", 
        tag: "Does it their way", 
        a: { label: "Your strength", text: "Independence and authenticity: you think for yourself and live on your terms." }, 
        b: { label: "Your shadow", text: "You can resist structure and help that would actually make life easier." }, 
        tip: "Some structure is freedom, not a cage. Let a few people in." 
      }, 
      "The Peacemaker": { 
        desc: "You create calm and harmony. The same instinct can quietly cost you your own voice.", 
        tag: "Keeps the peace", 
        a: { label: "Your strength", text: "You bring harmony and steadiness: people feel calmer around you." }, 
        b: { label: "Your shadow", text: "You can bury your own needs and opinions to keep things smooth." }, 
        tip: "Your needs count too. Sometimes honest is kinder than comfortable." 
      } 
    } 
  },
};

export const ARCHETYPE = [
  { when: ["Openness", "Extraversion"], name: "The Explorer", desc: "Curious and outgoing, chasing new experiences and bringing people along." },
  { when: ["Conscientiousness", "Steadiness"], name: "The Anchor", desc: "Reliable and calm, the steady one others lean on." },
  { when: ["Warmth", "Extraversion"], name: "The Connector", desc: "Warm and social, building bridges and bringing energy to a room." },
  { when: ["Openness", "Conscientiousness"], name: "The Architect", desc: "Imaginative and disciplined, turning big ideas into real things." },
  { when: ["Warmth", "Steadiness"], name: "The Harmoniser", desc: "Caring and even-keeled, keeping things calm and kind." },
  { when: ["Openness"], name: "The Seeker", desc: "Endlessly curious: ideas are your playground." },
];

export const VALUE_DESC: Record<string, string> = {
  Adventure: "You’re drawn to the new, growing by leaping.",
  Security: "You value stability and a sure footing.",
  Connection: "People come first; relationships are your anchor.",
  Achievement: "You’re driven to accomplish and rise to challenges.",
  Freedom: "Autonomy matters: you do it your way.",
  Growth: "You’re here to learn and become more.",
};

export const TEST_ORDER = ["checkin", "mood", "strengths", "bigfive", "values", "strengthshadow"];
/** Discovery hub order, excludes 'checkin' which lives on its own dedicated tab */
export const DISCOVER_TEST_ORDER = ["mood", "strengths", "bigfive", "values", "strengthshadow"];
export const STORAGE_KEY = "wm-discover";

// ─── Storage ─────────────────────────────────────────────────────
export function loadAll(): Record<string, SavedResult[]> {
  try { const v = localStorage.getItem(STORAGE_KEY); return v ? JSON.parse(v) : {}; } catch { return {}; }
}
export function saveAll(o: Record<string, SavedResult[]>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(o)); } catch { /* noop */ }
}
export function saveResult(id: string, res: SavedResult) {
  const a = loadAll(); if (!a[id]) a[id] = []; a[id].push(res); saveAll(a);
}

// ─── Scoring ─────────────────────────────────────────────────────
export function scoreProfile(items: TestItem[], resp: number[], scale?: [string, number][]): Record<string, number> {
  const s: Record<string, number> = {}, c: Record<string, number> = {};
  let minPoints = 1;
  let maxPoints = 5;
  if (scale && scale.length > 0) {
    const vals = scale.map(x => x[1]);
    minPoints = Math.min(...vals);
    maxPoints = Math.max(...vals);
  }
  const range = maxPoints - minPoints || 1;

  items.forEach((it, i) => { 
    const fallback = scale ? minPoints : 3;
    const v = resp[i] !== undefined ? resp[i] : fallback; 
    s[it.d] = (s[it.d] || 0) + v; 
    c[it.d] = (c[it.d] || 0) + 1; 
  });
  const o: Record<string, number> = {};
  Object.keys(s).forEach(d => { 
    o[d] = Math.round(((s[d] / c[d]) - minPoints) / range * 100); 
  });
  return o;
}
export function rankDims(sc: Record<string, number>): [string, number][] {
  return Object.entries(sc).sort((a, b) => b[1] - a[1]);
}
export function pickArchetype(sc: Record<string, number>) {
  const r = rankDims(sc), top = [r[0][0], r[1][0]];
  for (const a of ARCHETYPE) { if (a.when.every(w => top.includes(w))) return a; }
  return { name: "The " + r[0][0], desc: "You lead with " + r[0][0].toLowerCase() + "." };
}
