import { motion } from "framer-motion";
import { SvgIcon } from "./SvgIcon";
import { TESTS, DISCOVER_TEST_ORDER, loadAll, shade } from "./types";

interface HubViewProps {
  startTest: (id: string) => void;
  goTo: (v: 'hub' | 'test' | 'result' | 'results') => void;
}

export function HubView({ startTest, goTo }: HubViewProps) {
  const all = loadAll();
  return (
    <div className="pt-12 sm:pt-14 select-none">
      <p className="text-xs font-bold tracking-[.13em] uppercase text-ember mb-3">Self-Discovery</p>
      <h1 className="font-serif font-semibold text-[clamp(32px,6vw,52px)] leading-[1.02] tracking-tight text-ink">
        Get to know <em className="text-plum font-semibold italic font-serif">yourself.</em>
      </h1>
      <p className="text-ink-soft text-base max-w-[54ch] mt-4 leading-relaxed font-medium">
        Five quick self-discovery tests. Each takes about two minutes and hands back something worth keeping. Follow your curiosity — there's no wrong place to begin.
      </p>
      
      <div className="flex gap-4 flex-wrap mt-5 text-[13px] text-ink-soft">
        {['~2 minutes', 'Private to you', 'Never a diagnosis'].map(t => (
          <b key={t} className="flex items-center gap-1.5 font-bold">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-plum fill-none" style={{ strokeWidth: 2.6 }}>
              <path d="M5 12l4 4L19 7" />
            </svg>
            {t}
          </b>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mt-8 mb-4 flex-wrap">
        <button className="px-5 py-2 rounded-full text-[13.5px] font-extrabold bg-plum text-white border border-plum shadow-md shadow-plum/10 cursor-pointer">
          All tests
        </button>
        <button 
          onClick={() => goTo('results')} 
          className="px-5 py-2 rounded-full text-[13.5px] font-extrabold text-ink-soft border-[1.5px] border-line hover:bg-white transition cursor-pointer"
        >
          My collection
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
        {DISCOVER_TEST_ORDER.map((id, i) => {
          const t = TESTS[id]; 
          if (!t) return null;
          const done = all[id]?.length;
          return (
            <motion.button 
              key={id} 
              onClick={() => startTest(id)}
              className="text-left border border-line rounded-3xl bg-white overflow-hidden transition-shadow hover:shadow-[0_28px_50px_-28px_rgba(122,91,147,.25)] group relative cursor-pointer"
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.07, duration: 0.45 }}
              whileHover={{ y: -6 }}
            >
              {done ? (
                <div className="absolute top-3.5 right-3.5 z-[3] flex items-center gap-1.5 bg-plum text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                  <SvgIcon name="check" className="w-3 h-3 stroke-white fill-none" /> Done
                </div>
              ) : null}
              {/* Banner */}
              <div className="h-[82px] relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${t.accent}, ${shade(t.accent)})` }}>
                <svg className="absolute inset-0 w-full h-full opacity-[.08]" viewBox="0 0 200 80">
                  <circle cx="160" cy="20" r="40" fill="#fff" />
                  <circle cx="30" cy="60" r="25" fill="#fff" />
                  <circle cx="100" cy="10" r="15" fill="#fff" />
                </svg>
                <div 
                  className="absolute bottom-0 left-5 translate-y-[50%] w-[50px] h-[50px] rounded-[14px] flex items-center justify-center border-[3px] border-white z-[2] shadow-md"
                  style={{ background: `linear-gradient(135deg, ${t.accent}, ${shade(t.accent)})` }}
                >
                  <SvgIcon name={t.icon} className="w-6 h-6 stroke-white fill-none" />
                </div>
              </div>
              {/* Body */}
              <div className="pt-8 pb-5 px-5">
                <h3 className="font-serif text-[19px] font-extrabold mb-1.5 text-ink">{t.title}</h3>
                <p className="text-ink-soft text-[13.5px] leading-snug mb-4 font-medium">{t.blurb}</p>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-paper-2 text-ink-soft">{t.tag || '~2 min'}</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="text-[12px] text-ink-soft bg-paper-2/60 rounded-2xl p-4.5 border border-line mt-8 leading-relaxed font-semibold">
        WellMindly is a non-clinical self-reflection &amp; self-discovery tool, not a medical or psychological assessment. It doesn't diagnose anything. If something feels heavy, talking to a counsellor or someone you trust can help.
      </div>
    </div>
  );
}
