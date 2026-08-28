import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { Logo, SkipLink, useToast } from '../components/ui';
import { fadeUp } from '../lib/motion';

import { HubView } from '../components/discover/HubView';
import { TestView } from '../components/discover/TestView';
import { ResultView } from '../components/discover/ResultView';
import { CollectionView } from '../components/discover/CollectionView';
import { GatedResultView } from '../components/discover/GatedResultView';
import { useAuth } from '../context/AuthContext';

import {
  TESTS,
  saveResult,
  scoreProfile,
  rankDims,
  pickArchetype
} from '../components/discover/types';
import type { PictureOption, TestDef } from '../components/discover/types';

type View = 'hub' | 'test' | 'result' | 'results';

export function DiscoverPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [view, setView] = useState<View>('hub');
  const [curId, setCurId] = useState<string | null>(null);
  const [qi, setQi] = useState(0);
  const [resp, setResp] = useState<(number | string)[]>([]);
  const [resultData, setResultData] = useState<{
    kind: string; 
    scores?: Record<string, number>; 
    top?: string[];
    archetype?: { name: string; desc: string }; 
    pictureOption?: PictureOption;
  } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const cur = curId ? TESTS[curId] : null;

  const goTo = useCallback((v: View) => {
    setView(v);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ─── Start Test ──────────────────────────────────────────────
  const startTest = useCallback((id: string) => {
    setCurId(id);
    setQi(0);
    setResp([]);
    setResultData(null);
    goTo('test');
  }, [goTo]);

  // Handle auto-starting a test from the URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const startParam = params.get('start');
    if (startParam && TESTS[startParam]) {
      startTest(startParam);
      // Clean query parameter
      navigate('/discover', { replace: true });
    }
  }, [startTest, navigate]);

  // ─── Finish ──────────────────────────────────────────────────
  const finishTest = useCallback((id: string, test: TestDef, responses: (number | string)[]) => {
    if (test.kind === 'pairs') {
      const tally: Record<string, number> = {};
      responses.forEach(v => { tally[v as string] = (tally[v as string] || 0) + 1; });
      const ranked = Object.entries(tally).sort((a, b) => b[1] - a[1]);
      const top = ranked.slice(0, 2).map(x => x[0]);
      saveResult(id, { t: Date.now(), summary: top.join(' + '), top });
      setResultData({ kind: 'values', top });
      goTo('result'); 
      return;
    }
    
    const scores = scoreProfile(test.items!, responses as number[]);
    const ranked = rankDims(scores);
    
    if (test.kind === 'rank') {
      const top = ranked.slice(0, test.topN).map(x => x[0]);
      saveResult(id, { t: Date.now(), summary: top.join(', '), scores, top });
      setResultData({ kind: 'strengths', scores, top });
      goTo('result'); 
      return;
    }
    
    if (test.kind === 'type') {
      const top = ranked[0][0];
      saveResult(id, { t: Date.now(), summary: top, scores, top: [top] });
      setResultData({ kind: 'type', scores, top: [top] });
      goTo('result'); 
      return;
    }
    
    // profile
    saveResult(id, { t: Date.now(), summary: ranked[0][0] + ' strongest', scores });
    if (test.archetype) {
      const arch = pickArchetype(scores);
      setResultData({ kind: 'bigfive', scores, archetype: arch });
    } else {
      setResultData({ kind: 'checkin', scores });
    }
    goTo('result');
  }, [goTo]);

  // ─── Answer Likert ───────────────────────────────────────────
  const answerLikert = useCallback((val: number) => {
    if (!cur || !cur.items) return;
    const newResp = [...resp]; 
    newResp[qi] = val; 
    setResp(newResp);
    setTimeout(() => {
      if (qi < cur.items!.length - 1) { 
        setQi(qi + 1); 
      } else { 
        finishTest(curId!, cur, newResp); 
      }
    }, 200);
  }, [cur, curId, qi, resp, finishTest]);

  // ─── Answer Pair ─────────────────────────────────────────────
  const answerPair = useCallback((val: string) => {
    if (!cur || !cur.pairs) return;
    const newResp = [...resp]; 
    newResp[qi] = val; 
    setResp(newResp);
    if (qi < cur.pairs.length - 1) { 
      setQi(qi + 1); 
    } else { 
      finishTest(curId!, cur, newResp); 
    }
  }, [cur, curId, qi, resp, finishTest]);

  // ─── Answer Picture ──────────────────────────────────────────
  const answerPicture = useCallback((opt: PictureOption) => {
    if (!curId) return;
    saveResult(curId, { t: Date.now(), summary: opt.label, tone: opt.tone, label: opt.label });
    setResultData({ kind: 'picture', pictureOption: opt });
    goTo('result');
  }, [curId, goTo]);

  const total = cur?.kind === 'pairs' 
    ? (cur.pairs?.length || 0) 
    : cur?.kind === 'picture' 
      ? 1 
      : (cur?.items?.length || 0);
      
  const progress = total > 1 ? (qi / (total - 1)) * 100 : 100;

  return (
    <div className="min-h-screen relative z-[1] flex flex-col justify-between">
      <div>
        {/* Ambient blobs */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div 
            className="absolute w-[360px] h-[360px] rounded-full blur-3xl opacity-20 -top-20 -right-12 animate-drift"
            style={{ background: 'radial-gradient(circle, var(--color-plum-500), transparent 70%)' }} 
          />
          <div 
            className="absolute w-[300px] h-[300px] rounded-full blur-3xl opacity-20 bottom-[20%] -left-20 animate-drift"
            style={{ background: 'radial-gradient(circle, var(--color-sage-500), transparent 70%)', animationDelay: '-6s' }} 
          />
          <div 
            className="absolute w-[270px] h-[270px] rounded-full blur-3xl opacity-15 top-[40%] right-[10%] animate-drift"
            style={{ background: 'radial-gradient(circle, var(--color-plum-500), transparent 70%)', animationDelay: '-11s' }} 
          />
        </div>

        {/* Nav */}
        <SkipLink />
        <nav className="sticky top-0 z-50 backdrop-blur-xl bg-paper/80 border-b border-line/70">
          <div className="max-w-[920px] mx-auto flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-2">
              <Logo size="md" />
              <span className="hidden text-sm font-semibold text-ink-500 sm:inline">· Discover</span>
            </div>
          </div>
        </nav>

        <main id="main-content" tabIndex={-1} className="max-w-[920px] mx-auto px-5 pb-20 relative z-[1]">
          <AnimatePresence mode="wait">
            {/* ═══ HUB VIEW ═══ */}
            {view === 'hub' && (
              <motion.div 
                key="hub" 
                variants={fadeUp}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <HubView startTest={startTest} goTo={goTo} />
              </motion.div>
            )}

            {/* ═══ TEST VIEW ═══ */}
            {view === 'test' && cur && (
              <motion.div 
                key="test" 
                variants={fadeUp}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <h1 className="sr-only">{cur.title}</h1>
                <TestView 
                  cur={cur}
                  qi={qi}
                  resp={resp}
                  total={total}
                  progress={progress}
                  onBackClick={() => goTo('hub')}
                  onPrevQuestion={() => qi > 0 && setQi(qi - 1)}
                  onNextQuestion={() => {
                    if (resp[qi] === undefined) return;
                    if (qi < (cur.items?.length || 0) - 1) setQi(qi + 1);
                    else finishTest(curId!, cur, resp);
                  }}
                  onPickPicture={answerPicture}
                  onPickPair={answerPair}
                  onPickLikert={answerLikert}
                />
              </motion.div>
            )}

            {/* ═══ RESULT VIEW ═══ */}
            {view === 'result' && cur && resultData && (
              <motion.div 
                key="result" 
                variants={fadeUp}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <div className="max-w-[640px] mx-auto pt-7">
                  <h1 className="sr-only">{cur.title}</h1>
                  {user ? (
                    <ResultView 
                      cur={cur} 
                      curId={curId!} 
                      data={resultData} 
                      accent={cur.accent} 
                      accentTo={cur.accentTo}
                      cardRef={cardRef}
                      onRetake={() => startTest(curId!)} 
                      goTo={goTo} 
                    />
                  ) : (
                    <GatedResultView 
                      curId={curId!}
                      onBackClick={() => goTo('hub')}
                    />
                  )}
                </div>
              </motion.div>
            )}

            {/* ═══ COLLECTION VIEW ═══ */}
            {view === 'results' && (
              <motion.div 
                key="results" 
                variants={fadeUp}
                initial="hidden"
                animate="show"
                exit="exit"
              >
                <CollectionView startTest={startTest} goTo={goTo} showToast={toast} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-line py-8 text-ink-600 text-sm mt-10 relative z-[1] bg-paper-2/50">
        <div className="max-w-[920px] mx-auto px-5 flex justify-between flex-wrap gap-4 items-center">
          <Logo size="sm" />
          <div className="flex gap-5 flex-wrap font-bold">
            <button onClick={() => goTo('hub')} className="hover:text-ink-900 transition cursor-pointer border-none bg-transparent">Discover</button>
            <button onClick={() => goTo('results')} className="hover:text-ink-900 transition cursor-pointer border-none bg-transparent">My collection</button>
            <a href="https://988lifeline.org" target="_blank" rel="noopener noreferrer" className="text-coral-700 font-bold hover:underline inline-flex items-center gap-1.5">
              Need help right now? <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
        <p className="text-2xs text-center mt-5 max-w-[70ch] mx-auto opacity-85 leading-relaxed font-semibold">
          WellMindly is a non-clinical self-reflection &amp; self-discovery tool, not a diagnosis. If you&rsquo;re going through something heavy, please reach out to a qualified professional or someone you trust.
        </p>
      </footer>
    </div>
  );
}
