#!/usr/bin/env node
/* ============================================================================
   guard.mjs — static anti-pattern gate for frontend-student
   ----------------------------------------------------------------------------
   Run:  npm run guard              → only files you changed vs HEAD
         npm run guard -- --all     → whole tree (baseline debt report)
         npm run guard -- src/x.tsx → specific files

   Purpose: catch the mechanical mistakes that are known to happen in this
   codebase BEFORE a human/reviewer looks at the diff. Every rule here exists
   because the mistake was actually made at least once.

   Default scope is your own changes on purpose. The legacy tree still carries
   ~180 pre-existing violations (micro-type, raw hex) in files nobody has
   refactored yet; blocking on those would make the gate useless noise. You are
   responsible for the files you touch — and a file you touch must come out
   clean, including debt that was already in it.

   ERRORS  → exit 1. The task is not done until this is clean.
   WARNINGS→ exit 0. Reported for reviewer attention, not blocking.

   Opt out of a single line with a trailing comment:  // guard-ignore
   Zero dependencies. Node 18+.
   ========================================================================= */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, relative, resolve, sep } from "node:path";

const SRC = new URL("../src/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const ROOT = new URL("../", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");

/* -- rules ---------------------------------------------------------------- */

const ERRORS = [
  {
    id: "templated-class",
    // Tailwind v4 extracts classes statically; `bg-${x}-500` emits no CSS.
    // Only a real Tailwind utility stem followed by an interpolation is broken.
    // This deliberately does NOT match layoutId={`x-${id}`}, key={`${a}-${b}`},
    // or prose templates — those are legitimate and were 50/65 of the v1 hits.
    re: /(?:bg|text|border|from|to|via|ring|outline|fill|stroke|shadow|divide|w|h|min-w|min-h|max-w|max-h|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|gap|rounded|opacity|z|grid-cols|col-span|row-span|scale|rotate|duration|delay|leading|tracking|font|inset|top|bottom|left|right)-\$\{/,
    msg: "Templated class fragment (e.g. bg-${x}-500) emits no CSS. Write full literal class strings.",
  },
  {
    id: "phantom-z-utility",
    // --z-* are plain :root vars, not @theme tokens, so no utility is generated.
    re: /(?<![\w-])(?:hover:|focus:|md:|lg:|sm:)?z-(?:base|raised|sticky|nav|overlay|modal)(?![\w[-])/,
    msg: "z-nav / z-modal etc. generate no CSS. Use z-[var(--z-nav)].",
  },
  {
    id: "phantom-ink-950",
    re: /(?<![\w-])(?:bg|text|border|from|to|via|ring|outline|fill|stroke|shadow|divide)-ink-950(?![\w-])/,
    msg: "ink-950 does not exist. The ink ramp is 50→900.",
  },
  {
    id: "micro-type",
    re: /text-\[(?:[0-9]|10|11)px\]/,
    msg: "Body/label text below 12px. Use text-2xs (0.75rem) or larger.",
  },
  {
    id: "raw-hex",
    // Colors must come from tokens so the ramp stays the single source of truth.
    re: /(?:bg|text|border|from|to|via|ring|fill|stroke|shadow)-\[#[0-9a-fA-F]{3,8}\]|(?<!--)\bcolor:\s*#[0-9a-fA-F]{3,8}/,
    msg: "Raw hex colour. Use a design token from src/index.css.",
  },
  {
    id: "off-system-palette",
    // Tailwind's stock palettes are not in @theme, so they never move when the
    // ramp is retuned — that is exactly the four-drifted-visual-languages
    // problem the redesign exists to kill. Our ramps: ink, plum, teal, coral,
    // gold, rose, sage (all 50→900). Anything else is drift.
    // `emerald` shipped in ExploreToolsSection before this rule existed.
    re: /(?<![\w-])(?:bg|text|border|from|to|via|ring-offset|ring|outline|fill|stroke|divide|shadow|decoration|accent|caret|placeholder)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|cyan|sky|blue|indigo|violet|purple|fuchsia|pink)-(?:50|[1-9]00|950)(?![\w-])/,
    msg: "Off-system Tailwind palette. Use an @theme ramp: ink, plum, teal, coral, gold, rose, sage. (green → sage, slate/gray → ink, amber → gold, red → coral.)",
  },
  {
    id: "raw-white",
    // Surfaces come from --color-paper / --color-paper-2 / --color-card; light
    // foreground on a brand fill comes from that ramp's 50 step. Raw white is
    // a token bypass, and there were 16 of them on the landing page.
    // `ring-offset` is listed before `ring` so the longer prefix wins.
    re: /(?<![\w-])(?:bg|text|border|from|to|via|ring-offset|ring|outline|fill|stroke|divide|decoration|placeholder)-white(?:\/\d{1,3})?(?![\w-])/,
    msg: "Raw `white` bypasses the token system. Surface → bg-card / bg-paper. Text on a brand fill → that ramp's 50 step (e.g. text-plum-50).",
  },
  {
    id: "clickable-div",
    // Keyboard users cannot reach a div. Use <button> or <Link>.
    re: /<(?:div|span)\b[^>]*\sonClick=/,
    msg: "onClick on a div/span. Use <button>, <a>, or react-router <Link>.",
  },
  {
    id: "new-dependency",
    files: /package\.json$/,
    custom: (text) => {
      const allowed = new Set([
        "@capacitor/android", "@capacitor/cli", "@capacitor/core",
        "@codetrix-studio/capacitor-google-auth", "@react-oauth/google",
        "@tailwindcss/vite", "axios", "clsx", "framer-motion", "jspdf",
        "jwt-decode", "lucide-react", "react", "react-dom",
        "react-router-dom", "tailwind-merge",
      ]);
      const deps = JSON.parse(text).dependencies ?? {};
      return Object.keys(deps)
        .filter((d) => !allowed.has(d))
        .map((d) => ({ line: 0, msg: `New runtime dependency "${d}" added. The brief forbids unnecessary deps — get this approved first.` }));
    },
  },
  {
    id: "nested-gutter",
    files: /^src\/components\/.*\.tsx$/,
    // A component whose root element is a <section> is nested inside a layout
    // parent that already owns the route's horizontal gutter and max width
    // (LandingPage's <main>, DashboardLayout's content box). Re-applying
    // px-*/mx-auto/max-w-* on the section root doubles the gutter silently:
    // T-210 found 3 of 4 landing sections doing it, spending 48px of a 375px
    // viewport on padding and leaving 279px of content where 327px was
    // available. Nothing else in the toolchain can see this — it type-checks,
    // it builds, and it only shows up as "feels cramped on mobile".
    // A section that genuinely needs its own narrower box: guard-ignore on the
    // <section tag line. Inner wrappers are unaffected; only the root counts.
    custom: (text) => {
      const m = text.match(/return\s*\(\s*<section\b([^>]*)>/);
      if (!m) return [];
      const tag = m[0];
      if (tag.includes("guard-ignore")) return [];
      const bad = tag.match(/(?<![\w-])(?:px-\d[\d.]*|mx-auto|max-w-(?:xs|sm|md|lg|\d?xl|screen-\w+|\[[^\]]+\]))(?![\w-])/g);
      if (!bad) return [];
      const line = text.slice(0, m.index + m[0].indexOf("<section")).split("\n").length;
      return [{
        line,
        msg: `Root <section> re-applies its layout parent's gutter (${[...new Set(bad)].join(", ")}). The page's <main> already owns px-* and max-w-* — duplicating them here doubles the mobile gutter. Keep vertical padding and the border only.`,
      }];
    },
  },
];

const WARNINGS = [
  {
    id: "outline-none-no-ring",
    // Killing the outline is only OK when a ring (or an explicit outline width)
    // replaces it. v1 was single-line and false-positived on every multi-line
    // class list — Field.tsx puts outline-none and focus:ring-4 on adjacent
    // lines. `clearedBy` + `window` look ahead instead.
    // A tabpanel shipped with a bare outline-none before this rule existed.
    re: /(?<![\w-])(?:(?:focus|focus-visible|active):)?outline-none(?![\w-])/,
    clearedBy: /\b(?:focus|focus-visible|active):(?:ring|outline)-(?!none\b)/,
    window: 3,
    msg: "outline-none with no replacement ring nearby. Focusable elements need a visible indicator (WCAG 2.4.7).",
  },
  {
    id: "animate-height",
    // Animating height/width forces layout every frame. Worst on the mid-range
    // Android devices this Capacitor build actually ships to.
    re: /(?:height|width|maxHeight|maxWidth):\s*(?:"auto"|'auto'|`auto`)/,
    msg: "Animating height/width to auto thrashes layout. Animate opacity + transform (scaleY from origin-top) instead.",
  },
  {
    id: "pulse-animation",
    // Fine on a Skeleton. Never on status dots, hearts, or safety UI on a
    // mental-health product — it reads as an alarm and ignores reduced-motion.
    re: /(?<![\w-])animate-pulse(?![\w-])/,
    msg: "animate-pulse outside a Skeleton reads as an alarm and ignores prefers-reduced-motion. Use a static filled dot.",
  },
  {
    id: "emoji-glyph",
    re: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u,
    msg: "Emoji glyph. Fine as human copy; never as an icon — use lucide-react.",
  },
  {
    id: "icon-button-no-label",
    re: /<button(?![^>]*aria-label)(?![^>]*aria-labelledby)[^>]*>\s*\{?\s*<[A-Z]\w*\s[^>]*\/>\s*\}?\s*<\/button>/,
    msg: "Icon-only <button> with no accessible name. Add aria-label or use <IconButton label=…>.",
  },
  {
    id: "small-touch-target",
    re: /<button[^>]*className="[^"]*\b(?:p-0|p-0\.5|p-1|h-6|h-7|w-6|w-7)\b/,
    msg: "Touch target may be under 44×44px. Verify on a 375px viewport.",
  },
];

/* -- scope: which files to scan ------------------------------------------- */

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name.startsWith(".")) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|css)$/.test(name)) out.push(p);
  }
  return out;
}

/** Files changed vs HEAD (staged, unstaged and untracked), scoped to src/. */
function changedFiles() {
  const run = (cmd) => {
    try {
      return execSync(cmd, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    } catch {
      return "";
    }
  };
  const raw = [
    run("git diff --name-only --diff-filter=d HEAD -- ."),
    run("git ls-files --others --exclude-standard -- ."),
  ].join("\n");

  return [...new Set(raw.split("\n").map((s) => s.trim()).filter(Boolean))]
    .map((p) => resolve(ROOT, p.startsWith("frontend-student/") ? p.slice("frontend-student/".length) : p))
    .filter((p) => /\.(tsx?|css|json)$/.test(p) && existsSync(p));
}

const argv = process.argv.slice(2);
const explicit = argv.filter((a) => !a.startsWith("--"));

let files;
let scopeLabel;
if (explicit.length) {
  const missing = [];
  files = explicit.flatMap((p) => {
    const abs = resolve(ROOT, p);
    if (!existsSync(abs)) {
      missing.push(p);
      return [];
    }
    // A directory argument means "every source file under here".
    return statSync(abs).isDirectory() ? walk(abs) : [abs];
  });
  if (missing.length) {
    console.log(`\n⚠  guard: ${missing.length} path(s) do not exist and were skipped:`);
    for (const m of missing) console.log(`     ${m}`);
  }
  if (!files.length) {
    console.log("\n✖  guard: none of the named paths exist. Nothing checked.\n");
    process.exit(1);
  }
  scopeLabel = `${files.length} file(s) from ${explicit.length} path(s) named on the command line`;
} else if (argv.includes("--all")) {
  files = [...walk(SRC), join(ROOT, "package.json")];
  scopeLabel = "whole tree (--all)";
} else {
  files = changedFiles();
  scopeLabel = "files changed vs HEAD";
  if (!files.length) {
    console.log("\n✔  guard: no changed files to check.\n");
    process.exit(0);
  }
}

const found = { error: [], warn: [] };

for (const file of files) {
  const rel = relative(ROOT, file).split(sep).join("/");
  const text = readFileSync(file, "utf8");
  const lines = text.split("\n");

  for (const [bucket, rules] of [["error", ERRORS], ["warn", WARNINGS]]) {
    for (const rule of rules) {
      if (rule.files && !rule.files.test(rel)) continue;
      if (!rule.files && /package\.json$/.test(rel)) continue;

      if (rule.custom) {
        for (const hit of rule.custom(text)) {
          found[bucket].push({ rel, line: hit.line, id: rule.id, msg: hit.msg });
        }
        continue;
      }
      let inBlock = false;
      lines.forEach((line, i) => {
        if (line.includes("guard-ignore")) return;
        const t = line.trimStart();
        if (t.startsWith("/*")) inBlock = true;
        const isComment = inBlock || t.startsWith("//") || t.startsWith("*");
        if (t.includes("*/")) inBlock = false;
        if (isComment) return;
        if (!rule.re.test(line)) return;
        // Some rules can only decide by looking at the following lines — a
        // focus ring is routinely on the next line of a wrapped class list.
        if (rule.clearedBy && rule.clearedBy.test(lines.slice(i, i + (rule.window ?? 2)).join(" "))) return;
        found[bucket].push({ rel, line: i + 1, id: rule.id, msg: rule.msg });
      });
    }
  }
}

/* -- report --------------------------------------------------------------- */

const fmt = (h) => `  ${h.rel}:${h.line}  [${h.id}]\n      ${h.msg}`;

/** Per-rule tally, so a large legacy scope stays readable at a glance. */
function tally(hits) {
  const byRule = new Map();
  for (const h of hits) byRule.set(h.id, (byRule.get(h.id) ?? 0) + 1);
  const byFile = new Map();
  for (const h of hits) byFile.set(h.rel, (byFile.get(h.rel) ?? 0) + 1);
  const rules = [...byRule].sort((a, b) => b[1] - a[1]);
  const files = [...byFile].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const pad = Math.max(...rules.map(([id]) => id.length));
  return [
    "  by rule:",
    ...rules.map(([id, n]) => `    ${id.padEnd(pad)}  ${String(n).padStart(4)}`),
    `  worst files (top ${files.length}):`,
    ...files.map(([rel, n]) => `    ${String(n).padStart(4)}  ${rel}`),
  ].join("\n");
}

if (found.warn.length) {
  console.log(`\n⚠  ${found.warn.length} warning(s) — not blocking, but the reviewer will see these:\n`);
  console.log(found.warn.map(fmt).join("\n"));
}

if (found.error.length) {
  console.error(`\n✖  ${found.error.length} error(s) — fix these before marking the task done:\n`);
  console.error(found.error.map(fmt).join("\n"));
  console.error(`\n─── summary ─────────────────────────────────────────────`);
  console.error(tally(found.error));
  console.error(`\nScope: ${scopeLabel} (${files.length} file(s)).`);
  console.error(
    `Tip: a wide scope surfaces the whole legacy backlog. Scope to what you actually`,
  );
  console.error(`     changed — e.g.  node scripts/guard.mjs src/pages/LandingPage.tsx\n`);
  process.exit(1);
}

console.log(`\n✔  guard clean — ${scopeLabel}: ${files.length} file(s), 0 errors, ${found.warn.length} warning(s).\n`);
