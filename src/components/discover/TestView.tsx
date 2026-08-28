import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button, Card, ProgressBar } from "../ui";
import type { TestDef, PictureOption } from "./types";
import { PictureMode } from "./PictureMode";
import { PairMode } from "./PairMode";
import { LikertMode } from "./LikertMode";

interface TestViewProps {
  cur: TestDef;
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
  const questionRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    questionRef.current?.focus();
  }, [qi]);

  return (
    <div className="mx-auto max-w-[640px] pt-7">
      <Button variant="ghost" size="sm" onClick={onBackClick} leadingIcon={<ArrowLeft />} className="mb-5">
        All tests
      </Button>
      
      <Card padding="lg" elevation="floating">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-600">{cur.title}</p>
        <ProgressBar
          className="mt-4"
          tone={cur.tone}
          value={progress}
          label="Quiz progress"
          valueText={`Question ${qi + 1} of ${total}`}
        />

        {/* Question body */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={qi} 
            ref={questionRef}
            tabIndex={-1}
            role="group"
            aria-label={`Question ${qi + 1} of ${total}`}
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
                scale={cur.scale}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav buttons */}
        {cur.kind !== 'picture' && cur.kind !== 'pairs' && (
          <div className="mt-8 flex justify-between border-t border-line/40 pt-4">
            <Button 
              variant="outline"
              onClick={onPrevQuestion}
              className={qi === 0 ? "invisible" : undefined}
            >
              Back
            </Button>
            <Button 
              variant="primary"
              onClick={onNextQuestion}
              disabled={resp[qi] === undefined}
            >
              Next
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
