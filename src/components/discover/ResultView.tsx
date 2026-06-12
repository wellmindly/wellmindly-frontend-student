import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { SvgIcon } from "./SvgIcon";
import { rankDims, shade, toneWord, VALUE_DESC } from "./types";
import type { TestDef, PictureOption } from "./types";

interface ResultViewProps {
  cur: TestDef;
  curId: string;
  data: {
    kind: string;
    scores?: Record<string, number>;
    top?: string[];
    archetype?: { name: string; desc: string };
    pictureOption?: PictureOption;
    aiFeedback?: { headline: string; narrative: string; tip: string; insights?: string[] };
  };
  accent: string;
  cardRef: React.RefObject<HTMLDivElement | null>;
  reportRef: React.RefObject<HTMLDivElement | null>;
  onSaveCard: () => void;
  onSaveReportPdf: () => void;
  onRetake: () => void;
  goTo: (v: 'hub' | 'test' | 'result' | 'results') => void;
  resultsData?: any;
  onComingSoonClick?: (feature: "writemindly" | "talkmindly" | "sessionbooking") => void;
}

export function ResultView({
  cur,
  curId,
  data,
  accent,
  cardRef,
  reportRef,
  onSaveCard,
  onSaveReportPdf,
  onRetake,
  goTo,
  resultsData,
  onComingSoonClick,
}: ResultViewProps) {
  const ranked = data.scores ? rankDims(data.scores) : [];

  // Filter and sort historical attempts for this test
  const historyAttempts = useMemo(() => {
    if (!resultsData?.timeline) return [];
    return resultsData.timeline
      .filter((r: any) => r.quizTitle === cur.title)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [resultsData, cur.title]);

  // Compute trend information
  const trendInfo = useMemo(() => {
    if (historyAttempts.length < 2) return null;
    const currentAttempt = historyAttempts[historyAttempts.length - 1];
    const prevAttempt = historyAttempts[historyAttempts.length - 2];
    
    if (currentAttempt.score !== undefined && prevAttempt.score !== undefined) {
      const diff = currentAttempt.score - prevAttempt.score;
      if (diff > 0) {
        return `Your wellbeing score has increased by ${diff} points since your last check-in. You're feeling a bit steadier.`;
      } else if (diff < 0) {
        return `Your wellbeing score is down by ${Math.abs(diff)} points compared to your last check-in. It's okay to sit in this heavier stretch.`;
      } else {
        return `Your wellbeing score is steady and identical to your last check-in.`;
      }
    }
    return `This is your ${historyAttempts.length}th check-in. You are building a rich pattern of self-discovery.`;
  }, [historyAttempts]);

  // 1. Picture results layout
  const renderContent = () => {
    if (data.kind === 'picture' && data.pictureOption) {
      const opt = data.pictureOption;
      return (
        <div className="text-center space-y-5">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 shadow-md" style={{ background: `linear-gradient(140deg, ${opt.c1}, ${opt.c2})` }} />
          <h2 className="font-serif font-extrabold text-3xl mb-3 text-ink">
            {data.aiFeedback ? data.aiFeedback.headline : `${opt.label}.`}
          </h2>
          <p className="font-serif text-lg text-ink-soft leading-relaxed font-medium">
            {data.aiFeedback ? data.aiFeedback.narrative : (
              <>Noted — today felt <b className="text-plum font-extrabold">{opt.label.toLowerCase()}</b>. That's a tile on your moodboard now. The pattern across days tells the real story.</>
            )}
          </p>
        </div>
      );
    }

    // 2. Values results layout
    if (data.kind === 'values' && data.top) {
      return (
        <div className="space-y-5">
          <h2 className="font-serif font-medium text-[clamp(24px,4.4vw,36px)] leading-tight text-ink">
            {data.aiFeedback ? data.aiFeedback.headline : (
              <>You lead with <em className="italic font-serif text-plum">{data.top[0]}</em>.</>
            )}
          </h2>
          <p className="font-serif text-lg leading-relaxed text-ink-soft font-medium mt-1">
            {data.aiFeedback ? data.aiFeedback.narrative : (VALUE_DESC[data.top[0]] || '')}
          </p>
          
          {!data.aiFeedback && data.top[1] && (
            <div className="border-l-[3px] border-plum bg-[#fffdf8]/60 backdrop-blur-sm rounded-r-[14px] p-5 text-[14.5px] shadow-sm font-semibold text-ink-soft">
              <h4 className="text-xs tracking-wider uppercase text-ink-soft font-extrabold mb-1">Your second value</h4>
              <b className="text-ink font-bold">{data.top[1]}</b> — {VALUE_DESC[data.top[1]] || ''}
            </div>
          )}
          
          <ShareCard accent={accent} cardRef={cardRef}>
            <h3 className="font-serif font-extrabold text-[13px] tracking-[.16em] uppercase opacity-80 mb-3">What matters most</h3>
            <div className="flex flex-col gap-2.5">
              {data.top.map((s, i) => (
                <div key={s} className="flex items-center gap-3 text-base font-bold">
                  <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-[13px] font-black flex-shrink-0">{i + 1}</span>
                  {s}
                </div>
              ))}
            </div>
            <p className="mt-5 text-[10px] opacity-75 tracking-wider uppercase font-bold">WellMindly · Discover</p>
          </ShareCard>
        </div>
      );
    }

    // 3. Signature strengths layout
    if (data.kind === 'strengths' && data.top && data.scores) {
      return (
        <div className="space-y-5">
          <h2 className="font-serif font-medium text-[clamp(24px,4.4vw,36px)] leading-tight text-ink">
            {data.aiFeedback ? data.aiFeedback.headline : (
              <>Your top <em className="italic font-serif text-plum">strengths.</em></>
            )}
          </h2>
          <p className="font-serif text-lg leading-relaxed text-ink-soft font-medium mt-1">
            {data.aiFeedback ? data.aiFeedback.narrative : "These are the qualities you lead with. Leaning into your signature strengths — on purpose, this week — is one of the most reliable ways to feel more like yourself."}
          </p>

          <ShareCard accent={accent} cardRef={cardRef}>
            <h3 className="font-serif font-extrabold text-[13px] tracking-[.16em] uppercase opacity-80 mb-3">My signature strengths</h3>
            <div className="flex flex-col gap-2.5">
              {data.top.map((s, i) => (
                <div key={s} className="flex items-center gap-3 text-base font-bold">
                  <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-[13px] font-black flex-shrink-0">{i + 1}</span>
                  {s}
                </div>
              ))}
            </div>
            <p className="mt-5 text-[10px] opacity-75 tracking-wider uppercase font-bold">WellMindly · Discover</p>
          </ShareCard>
          
          <div className="bg-white/60 border border-white/20 rounded-3xl p-6 shadow-sm">
            <p className="text-xs tracking-widest uppercase text-ink-soft font-extrabold mb-4 border-b border-line/45 pb-2">Full ranking</p>
            {ranked.map(([label, val], i) => (
              <DimBar key={label} label={label} value={val} accent={accent} delay={i * 0.08} />
            ))}
          </div>
        </div>
      );
    }

    // 4. Character archetype / Type layout
    if (data.kind === 'type' && data.top && data.scores) {
      const topType = data.top[0];
      const typeInfo = cur.types?.[topType];
      return (
        <div className="space-y-5">
          <h2 className="font-serif font-medium text-[clamp(24px,4.4vw,36px)] leading-tight text-ink">
            {data.aiFeedback ? data.aiFeedback.headline : (
              <>{cur.reveal || 'You’re'} <em className="italic font-serif text-plum">{topType}</em>.</>
            )}
          </h2>
          <p className="font-serif text-lg leading-relaxed text-ink-soft font-medium mt-1">
            {data.aiFeedback ? data.aiFeedback.narrative : (typeInfo?.desc || '')}
          </p>
          
          {cur.card && (
            <ShareCard accent={accent} cardRef={cardRef}>
              <h3 className="font-serif font-extrabold text-[13px] tracking-[.16em] uppercase opacity-80 mb-3">{cur.cardLabel || 'My result'}</h3>
              <p className="font-serif text-4xl font-extrabold leading-tight mb-3">{topType}</p>
              <p className="text-[10px] opacity-75 tracking-wider uppercase font-bold">{typeInfo?.tag || cur.title} · WellMindly</p>
            </ShareCard>
          )}
          
          {!data.aiFeedback && typeInfo?.a && <InsightBlock borderColor="#3D6E66" label={typeInfo.a.label} text={typeInfo.a.text} />}
          {!data.aiFeedback && typeInfo?.b && <InsightBlock borderColor="#B3583E" label={typeInfo.b.label} text={typeInfo.b.text} />}
          
          <div className="bg-white/60 border border-white/20 rounded-3xl p-6 shadow-sm">
            <p className="text-xs tracking-widest uppercase text-ink-soft font-extrabold mb-4 border-b border-line/45 pb-2">How it broke down</p>
            {ranked.map(([label, val], i) => (
              <DimBar key={label} label={label} value={val} accent={accent} delay={i * 0.08} />
            ))}
          </div>
        </div>
      );
    }

    // 5. Big Five personality layout
    if (data.kind === 'bigfive' && data.archetype && data.scores) {
      const arch = data.archetype;
      return (
        <div className="space-y-5">
          <h2 className="font-serif font-medium text-[clamp(24px,4.4vw,36px)] leading-tight text-ink">
            {data.aiFeedback ? data.aiFeedback.headline : (
              <>You're <em className="italic font-serif text-plum">{arch.name}</em>.</>
            )}
          </h2>
          <p className="font-serif text-lg leading-relaxed text-ink-soft font-medium mt-1">
            {data.aiFeedback ? data.aiFeedback.narrative : arch.desc}
          </p>

          <ShareCard accent={accent} cardRef={cardRef}>
            <h3 className="font-serif font-extrabold text-[13px] tracking-[.16em] uppercase opacity-80 mb-3">My personality archetype</h3>
            <p className="font-serif text-4xl font-extrabold leading-tight mb-3">{arch.name}</p>
            <p className="text-[10px] opacity-75 tracking-wider uppercase font-bold">WellMindly · Discover</p>
          </ShareCard>
          
          <div className="bg-white/60 border border-white/20 rounded-3xl p-6 shadow-sm">
            <p className="text-xs tracking-widest uppercase text-ink-soft font-extrabold mb-4 border-b border-line/45 pb-2">Your five traits</p>
            {ranked.map(([label, val], i) => (
              <DimBar key={label} label={label} value={val} accent={accent} delay={i * 0.08} />
            ))}
          </div>
        </div>
      );
    }

    // 6. Wellness Check-in report layout
    if (data.kind === 'checkin' && data.scores) {
      const avg = Object.values(data.scores).reduce((a, b) => a + b, 0) / Object.values(data.scores).length;
      const tone = avg >= 70 ? "You're doing well." : avg >= 45 ? "Finding your footing." : "A heavier stretch.";
      return (
        <div className="space-y-5">
          <h2 className="font-serif font-medium text-[clamp(24px,4.4vw,36px)] leading-tight text-ink">
            {data.aiFeedback ? data.aiFeedback.headline : tone}
          </h2>
          <p className="font-serif text-lg leading-relaxed text-ink-soft font-medium mt-1">
            {data.aiFeedback ? data.aiFeedback.narrative : "This is a snapshot, not a score. Use it to notice how your weeks shift. The patterns over time tell a richer story than any single check-in."}
          </p>

          <div className="bg-white/60 border border-white/20 rounded-3xl p-6 shadow-sm">
            <p className="text-xs tracking-widest uppercase text-ink-soft font-extrabold mb-4 border-b border-line/45 pb-2">Your dimensions</p>
            {ranked.map(([label, val], i) => (
              <DimBar key={label} label={label} value={val} accent={accent} delay={i * 0.08} />
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div ref={reportRef} id="printable-report-card" className="space-y-6 select-none bg-white/70 border border-white/20 rounded-[32px] p-8 shadow-xl backdrop-blur-md relative overflow-hidden transition-all duration-300">
      
      {/* Printable page header */}
      <div className="hidden print:block border-b border-slate-200 pb-4 mb-6">
        <h1 className="text-2xl font-black font-serif text-slate-900">WellMindly</h1>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{cur.title} Assessment Report</p>
      </div>

      {/* category badge */}
      <div className="flex items-center justify-between no-print">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accent }} />
          <span className="text-xs font-black tracking-wider uppercase text-slate-500">{cur.title}</span>
        </div>
        <span className="text-[11px] font-bold px-3 py-1 bg-paper-2 rounded-full text-slate-500 border border-line select-none">
          {cur.tag || '~2 min'}
        </span>
      </div>

      {/* Main Layout Content */}
      {renderContent()}

      {/* Dynamic Observations list */}
      {data.aiFeedback?.insights && data.aiFeedback.insights.length > 0 && (
        <div className="bg-white/50 border border-white/20 rounded-3xl p-6 shadow-sm select-none">
          <h4 className="text-xs tracking-wider uppercase text-plum font-extrabold mb-3">Key Observations</h4>
          <ul className="space-y-3 text-[14.5px] text-ink-soft font-medium">
            {data.aiFeedback.insights.map((ins, idx) => (
              <li key={idx} className="flex gap-3 items-start leading-relaxed">
                <span className="text-plum shrink-0 text-base">✦</span>
                <span>{ins}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Tip */}
      {data.aiFeedback?.tip ? (
        <InsightBlock borderColor={accent} label="Try this next" text={data.aiFeedback.tip} />
      ) : (
        (cur.types?.[data.top?.[0] || '']?.tip) && (
          <InsightBlock borderColor={accent} label="Try this next" text={cur.types[data.top![0]].tip!} />
        )
      )}

      {/* Trajectory History Timeline */}
      {historyAttempts.length > 0 && (
        <div className="bg-white/50 border border-white/20 rounded-3xl p-6 shadow-sm no-print space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/50 pb-3">
            <h4 className="text-xs tracking-wider uppercase text-plum font-extrabold">Your Check-in History</h4>
            <span className="text-[11px] font-bold px-2.5 py-0.5 bg-paper-2 rounded-full text-ink-soft">
              {historyAttempts.length} {historyAttempts.length === 1 ? 'Attempt' : 'Attempts'}
            </span>
          </div>
          
          {trendInfo && (
            <p className="text-sm font-semibold text-ink-soft italic leading-relaxed bg-plum/5 p-3.5 rounded-xl border border-plum/10">
              {trendInfo}
            </p>
          )}
          
          <div className="relative pl-6 border-l-2 border-slate-200/80 space-y-5 py-2">
            {historyAttempts.map((att: any, idx: number) => {
              const d = new Date(att.date);
              const isLatest = idx === historyAttempts.length - 1;
              return (
                <div key={att.id || idx} className="relative">
                  {/* Timeline Dot */}
                  <div className={`absolute left-[-31px] top-1.5 w-2.5 h-2.5 rounded-full border-2 bg-white ${isLatest ? 'border-plum scale-125 shadow-md shadow-plum/20' : 'border-slate-300'}`} />
                  
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[13.5px] font-extrabold text-ink leading-tight">
                        {att.classification || 'Completed'}
                        {isLatest && <span className="ml-2.5 text-[9px] bg-plum text-white px-2 py-0.5 rounded-full uppercase font-black tracking-wider">Latest</span>}
                      </p>
                      <p className="text-[11px] text-ink-soft opacity-70 font-semibold mt-0.5">
                        {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    {att.score !== undefined && (
                      <span className="text-[13px] font-bold text-ink-soft bg-paper-2 px-2.5 py-0.5 rounded-lg border border-line">
                        Score: {att.score} / {att.maxScore}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Connected services CTAs */}
      {onComingSoonClick && (
        <div className="bg-white/50 border border-white/20 rounded-3xl p-6 shadow-sm no-print space-y-4">
          <h4 className="text-xs tracking-wider uppercase text-plum font-extrabold">Connected Services</h4>
          <p className="text-xs text-ink-soft font-medium leading-relaxed">
            Need to talk through these insights or find support? Reach out to our campus channels directly.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button 
              onClick={() => onComingSoonClick('talkmindly')}
              className="cursor-pointer flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-sm transition active:scale-[.97]"
            >
              <span>💬 Talk to Mindly</span>
            </button>
            <button 
              onClick={() => onComingSoonClick('sessionbooking')}
              className="cursor-pointer flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-extrabold text-sm transition active:scale-[.97]"
            >
              <span>📅 Book a Session</span>
            </button>
          </div>
        </div>
      )}

      {/* Card buttons row */}
      <div className="flex gap-3.5 flex-wrap mt-8 pt-4 border-t border-line/40 no-print">
        <button 
          onClick={onSaveCard} 
          className="cursor-pointer inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-plum border border-plum/30 font-extrabold text-[14.5px] shadow-sm transition hover:-translate-y-0.5 active:scale-[.97]"
        >
          <span>🖼️ Share Card Image</span>
        </button>
        <button 
          onClick={onSaveReportPdf} 
          className="cursor-pointer inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-plum hover:bg-plum/90 text-white font-extrabold text-[14.5px] shadow-lg shadow-plum/20 transition hover:-translate-y-0.5 active:scale-[.97] border-none"
        >
          <span>📄 Save Report (PDF)</span>
        </button>
        <button 
          onClick={onRetake} 
          className="cursor-pointer px-6 py-3.5 rounded-full border-[1.5px] border-line text-ink-soft font-extrabold text-[14.5px] hover:bg-white transition active:scale-[.97] bg-transparent"
        >
          Take again
        </button>
      </div>

      {/* Back navigation buttons */}
      <div className="flex gap-3.5 flex-wrap mt-2 justify-center no-print">
        <button 
          onClick={() => goTo('hub')} 
          className="cursor-pointer text-sm font-extrabold text-plum hover:underline"
        >
          Explore More Tests &rarr;
        </button>
      </div>

      {/* Print styles block */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report-card, #printable-report-card * {
            visibility: visible;
          }
          #printable-report-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Layout Helper: Svg Icons Share Card ──────────────────────────
function ShareCard({ accent, children, cardRef }: { accent: string; children: React.ReactNode; cardRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div 
      ref={cardRef} 
      className="rounded-[22px] p-8 text-white relative overflow-hidden shadow-xl"
      style={{ background: `linear-gradient(135deg, ${accent}, ${shade(accent)})` }}
    >
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='3' cy='3' r='1.5' fill='%23fff' opacity='.08'/%3E%3C/svg%3E")` }} 
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

// ─── Layout Helper: Animated Bar ──────────────────────────────────
function DimBar({ label, value, accent, delay }: { label: string; value: number; accent: string; delay: number }) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1.5">
        <b className="font-bold text-ink">{label}</b>
        <span className="text-ink-soft text-[13px] font-semibold">{toneWord(value)}</span>
      </div>
      <div className="h-3 bg-paper-2 rounded-full overflow-hidden">
        <motion.div 
          className="h-full rounded-full" 
          style={{ background: accent }}
          initial={{ width: 0 }} 
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, delay, ease: [0.3, 0, 0.2, 1] }} 
        />
      </div>
    </div>
  );
}

// ─── Layout Helper: Insight Block ──────────────────────────────────
function InsightBlock({ borderColor, label, text }: { borderColor: string; label: string; text: string }) {
  return (
    <div className="border-l-[3px] bg-white/50 rounded-r-[14px] p-5 my-3 text-[14.5px] border-y border-r border-line shadow-sm text-ink-soft font-medium" style={{ borderColor }}>
      <h4 className="text-xs tracking-wider uppercase text-ink font-extrabold mb-1" style={{ color: borderColor }}>{label}</h4>
      {text}
    </div>
  );
}
