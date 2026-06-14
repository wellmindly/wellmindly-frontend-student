import { motion, AnimatePresence } from "framer-motion";
import { shade } from "./types";
import type { TestDef, PictureOption } from "./types";
import { PictureMode } from "./PictureMode";
import { PairMode } from "./PairMode";
import { LikertMode } from "./LikertMode";

interface TestViewProps {
  cur: TestDef;
  curId: string;
  qi: number;
  resp: (number | string)[];
  total: number;
  progress: number;
  onBackClick: () => void;
  onPrevQuestion: () => void;
  onNextQuestion: () => void;
  onPickPicture: (opt: PictureOption) => void;
  onPickPair: (val: string) => void;
  onPickLikert: (val: number) => void;
}

export function TestView({
  cur,
  qi,
  resp,
  total,
  progress,
  onBackClick,
  onPrevQuestion,
  onNextQuestion,
  onPickPicture,
  onPickPair,
  onPickLikert,
}: TestViewProps) {
  return (
    <div className="max-w-[640px] mx-auto pt-7 select-none">
      <button 
        onClick={onBackClick} 
        className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink mb-5 transition font-bold cursor-pointer border-none bg-transparent"
      >
        &larr; All tests
      </button>
      
      <div className="bg-white border border-line rounded-3xl shadow-[0_18px_40px_-22px_rgba(122,91,147,.2)] p-8">
        <div className="flex justify-between text-xs tracking-widest uppercase text-ink-soft font-extrabold">
          <span>{qi + 1} / {total}</span>
          <span>{cur.title}</span>
        </div>
        
        {/* Progress bar */}
        <div className="h-[7px] bg-paper-2 rounded-full overflow-hidden my-4 relative">
          <motion.div 
            className="h-full rounded-full relative animate-pulse" 
            style={{ background: `linear-gradient(90deg, ${cur.accent}, ${shade(cur.accent)})` }}
            animate={{ width: `${progress}%` }} 
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <span 
              className="absolute right-0 top-[-2px] w-[11px] h-[11px] rounded-full shadow-[0_0_10px_2px]"
              style={{ background: cur.accent, boxShadow: `0 0 10px 2px ${cur.accent}33` }} 
            />
          </motion.div>
        </div>

        {/* Question body */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={qi} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -8 }} 
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            {cur.kind === 'picture' && cur.options && (
              <PictureMode options={cur.options} onPick={onPickPicture} />
            )}
            {cur.kind === 'pairs' && cur.pairs && (
              <PairMode pair={cur.pairs[qi]} onPick={onPickPair} />
            )}
            {(cur.kind !== 'picture' && cur.kind !== 'pairs') && cur.items && (
              <LikertMode 
                intro={cur.intro || ''} 
                question={cur.items[qi].q} 
                selected={resp[qi] as number | undefined} 
                onPick={onPickLikert} 
                accent={cur.accent} 
                scale={cur.scale}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav buttons */}
        {cur.kind !== 'picture' && cur.kind !== 'pairs' && (
          <div className="flex justify-between mt-8 pt-4 border-t border-line/40">
            <button 
              onClick={onPrevQuestion}
              className={`px-6 py-2.5 rounded-full border border-line text-ink-soft font-bold text-[14.5px] transition hover:bg-paper-2 hover:text-ink active:scale-[.97] cursor-pointer bg-white ${qi === 0 ? 'invisible' : ''}`}
            >
              Back
            </button>
            <button 
              onClick={onNextQuestion}
              disabled={resp[qi] === undefined}
              className="px-7 py-2.5 rounded-full bg-plum hover:bg-plum/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[14.5px] shadow-lg shadow-plum/10 transition active:scale-[.97] cursor-pointer border-none"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
