import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SvgIcon } from "./SvgIcon";
import { TESTS, loadAll, saveAll } from "./types";
import type { SavedResult } from "./types";

interface CollectionViewProps {
  startTest: (id: string) => void;
  goTo: (v: 'hub' | 'test' | 'result' | 'results') => void;
  showToast: (m: string) => void;
}

export function CollectionView({ startTest, goTo, showToast }: CollectionViewProps) {
  const [, forceUpdate] = useState(0);
  const all = loadAll();
  const ids = Object.keys(all).filter(id => all[id]?.length && TESTS[id]);
  const attempts = ids.flatMap(id => 
    all[id].map((attempt, index) => ({
      id,
      attempt,
      index,
      totalAttempts: all[id].length
    }))
  ).sort((a, b) => b.attempt.t - a.attempt.t);

  useEffect(() => { 
    const handle = setTimeout(() => {
      forceUpdate(n => n + 1);
    }, 0);
    return () => clearTimeout(handle);
  }, []); // ensure fresh read

  const wipeAll = () => {
    if (!confirm('Clear all your saved results? This can\'t be undone.')) return;
    saveAll({} as Record<string, SavedResult[]>);
    forceUpdate(n => n + 1);
    showToast('All data cleared.');
  };

  return (
    <div className="pt-7 select-none">
      <p className="text-xs font-bold tracking-[.13em] uppercase text-ember mb-3">Your collection</p>
      <h1 className="font-serif font-semibold text-[clamp(32px,6vw,52px)] leading-[1.02] tracking-tight text-ink">
        What you've <em className="text-plum font-semibold italic font-serif">discovered.</em>
      </h1>
      <p className="text-ink-soft text-base mt-3 mb-5 font-semibold">Everything from your tests so far. Re-take any test to watch how you shift.</p>

      <div className="flex gap-1.5 mb-6 flex-wrap">
        <button 
          onClick={() => goTo('hub')} 
          className="px-5 py-2 rounded-full text-[13.5px] font-extrabold text-ink-soft border-[1.5px] border-line hover:bg-white transition cursor-pointer bg-transparent"
        >
          All tests
        </button>
        <button className="px-5 py-2 rounded-full text-[13.5px] font-extrabold bg-plum text-white border border-plum shadow-md shadow-plum/10 cursor-pointer">
          My collection
        </button>
      </div>

      {attempts.length === 0 ? (
        <div className="text-center text-ink-soft py-16 text-[15px] font-semibold">
          Nothing saved yet. Take a test and your results will appear here.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {attempts.map(({ id, attempt, index, totalAttempts }) => {
            const t = TESTS[id]; 
            const d = new Date(attempt.t);
            return (
              <motion.button 
                key={`${id}-${index}`} 
                onClick={() => startTest(id)}
                className="text-left bg-white border border-line rounded-3xl p-6 transition hover:shadow-lg cursor-pointer relative"
                whileHover={{ y: -3 }}
              >
                {totalAttempts > 1 && (
                  <span className="absolute top-3.5 right-3.5 text-[10px] font-bold px-2 py-0.5 bg-paper-2 rounded-full text-ink-soft border border-line select-none">
                    Attempt #{index + 1}
                  </span>
                )}
                <div className="flex items-center gap-2.5 mb-3 pr-20">
                  <div 
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center shadow-sm shrink-0"
                    style={{ background: `linear-gradient(135deg, ${t.accent}, ${shade(t.accent)})` }}
                  >
                    <SvgIcon name={t.icon} className="w-[18px] h-[18px] stroke-white fill-none" />
                  </div>
                  <span className="font-serif text-base font-extrabold text-ink truncate">{t.title}</span>
                </div>
                <p className="text-sm text-ink-soft mb-2 font-medium">{attempt.summary}</p>
                <p className="text-[11px] text-ink-soft opacity-70 font-semibold">
                  {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · {d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </p>
              </motion.button>
            );
          })}
        </div>
      )}

      {ids.length > 0 && (
        <button 
          onClick={wipeAll} 
          className="mt-8 px-6 py-2.5 rounded-full border-[1.5px] border-line text-ink-soft font-bold text-sm hover:bg-white hover:border-ink transition active:scale-[.97] cursor-pointer bg-transparent"
        >
          Reset all data
        </button>
      )}
    </div>
  );
}

// ─── Layout Helper: Svg Icons shade ──────────────────────────────
function shade(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, (n >> 16) - 30);
  const g = Math.max(0, ((n >> 8) & 255) - 26);
  const b = Math.max(0, (n & 255) - 22);
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
