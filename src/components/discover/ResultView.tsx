import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, LifeBuoy, Printer, Sparkle } from "lucide-react";
import { rankDims, toneWord, VALUE_DESC } from "./types";
import {
  isWellbeingCheckin,
  displayClassification,
  frequencyLabel,
} from "../../lib/wellbeing";
import type { TestDef, PictureOption, TestTone } from "./types";
import { FeedbackForm } from "./FeedbackForm";
import { checkinCopy, checkinDimWord, isEmotionalCheckin } from "../../lib/checkinCopy";
import { NextSteps } from "./NextSteps";
import { Button, Card, ProgressBar } from "../ui";
import { trackEvent } from "../../lib/analytics";

interface ResultViewProps {
  cur: TestDef;
  curId?: string;
  data: {
    resultId?: string | null;
    kind: string;
    scores?: Record<string, number>;
    top?: string[];
    archetype?: { name: string; desc: string };
    pictureOption?: PictureOption;
    aiFeedback?: { headline: string; narrative: string; tip: string; insights?: string[]; bandSafe?: boolean } | null;
    /** Raw total for the two check-ins, straight from the answers just given. */
    total?: number;
  };
  accent: string;
  accentTo?: string;
  cardRef: React.RefObject<HTMLDivElement | null>;
  reportRef?: React.RefObject<HTMLDivElement | null>;
  onRetake: () => void;
  goTo: (v: 'hub' | 'test' | 'result' | 'results') => void;
  resultsData?: any;
  onComingSoonClick?: (feature: "writemindly" | "talkmindly" | "sessionbooking") => void;
}

export function ResultView({
  cur,
  data,
  accent,
  accentTo = cur.accentTo,
  cardRef,
  reportRef,
  onRetake,
  goTo,
  resultsData,
  onComingSoonClick,
}: ResultViewProps) {
  const [showFeedback, setShowFeedback] = useState(true);
  const [showAllAttempts, setShowAllAttempts] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const ranked = data.scores ? rankDims(data.scores) : [];

  const isWellbeing = isWellbeingCheckin(cur.title);

  // Only the two overall-scored instruments (Wellbeing check-in, Emotional
  // check-in) produce a number worth showing. The rest submit a placeholder 100
  // and take their denominator from the Quiz row, which is sized from the item
  // count - so Strength & shadow rendered "Score: 100 / 40", a score above its
  // own maximum, under a result whose actual answer is "The Peacemaker".
  //
  // This screen has the TestDef in hand, so it can read `overall` directly. The
  // surfaces that only have a stored row ask `hasRealScore` in lib/wellbeing.ts,
  // which recovers the same answer from the title.
  const instrumentIsScored = cur.overall === true;

  // Filter and sort historical attempts for this test.
  // An exact `r.quizTitle === cur.title` match would have dropped every attempt
  // a student made before the rename - their stored rows still say
  // "PHQ-9 screening" - which would have emptied the score, the band and the
  // trend on this screen. `isWellbeingCheckin` spans both titles.
  const historyAttempts = useMemo(() => {
    if (!resultsData?.timeline) return [];
    const matchesThisTest = isWellbeing
      ? (r: any) => isWellbeingCheckin(r.quizTitle)
      : (r: any) => r.quizTitle === cur.title;
    return resultsData.timeline
      .filter(matchesThisTest)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [resultsData, cur.title, isWellbeing]);

  const displayAttempts = useMemo(() => {
    return [...historyAttempts].reverse();
  }, [historyAttempts]);

  // Compute trend information
  const trendInfo = useMemo(() => {
    const isEmotional = isEmotionalCheckin(cur.title);
    if ((!isWellbeing && !isEmotional) || historyAttempts.length < 2) return null;
    const currentAttempt = historyAttempts[historyAttempts.length - 1];
    const prevAttempt = historyAttempts[historyAttempts.length - 2];

    if (currentAttempt.score !== undefined && prevAttempt.score !== undefined) {
      const diff = currentAttempt.score - prevAttempt.score;
      if (diff === 0) return `Same score as your last check-in.`;
      // Wellbeing check-in: higher means more hard days. Emotional check-in:
      // higher means a better couple of weeks.
      const better = isWellbeing ? diff < 0 : diff > 0;
      const pts = `${Math.abs(diff)} ${Math.abs(diff) === 1 ? "point" : "points"}`;
      return better
        ? `${diff > 0 ? "Up" : "Down"} ${pts} since your last check-in. A little lighter than last time.`
        : `${diff > 0 ? "Up" : "Down"} ${pts} since your last check-in. A bit heavier than last time, worth noticing, not panicking about.`;
    }
    return null;
  }, [historyAttempts, isWellbeing, cur.title]);

  // Fixed, band-based copy for the two check-ins. The score decides the tone;
  // the AI never writes the headline here (see lib/checkinCopy.ts).
  const copy = useMemo(() => {
    if (!data.scores || !cur.overall) return null;
    const total =
      data.total ?? historyAttempts[historyAttempts.length - 1]?.score ?? 0;
    return checkinCopy(cur.title, total, data.scores);
  }, [cur.title, cur.overall, data.scores, data.total, historyAttempts]);
  const checkinTotal = data.total ?? historyAttempts[historyAttempts.length - 1]?.score;
  const checkinMax = cur.items
    ? cur.items.length * (cur.scale ? Math.max(...cur.scale.map((x) => x[1])) : 5)
    : undefined;
  // At most one AI line, and only when the server says it was written knowing
  // the band (older rows and other tests never qualify).
  const extraInsight =
    copy && data.aiFeedback?.bandSafe ? data.aiFeedback.insights?.[0] : undefined;
  const insights = copy
    ? [...copy.insights, ...(extraInsight ? [extraInsight] : [])]
    : data.aiFeedback?.insights ?? [];
  const tipText = copy
    ? copy.tip
    : data.aiFeedback?.tip || cur.types?.[data.top?.[0] || ""]?.tip;

  // 1. Picture results layout
  const renderContent = () => {
    if (data.kind === 'picture' && data.pictureOption) {
      const opt = data.pictureOption;
      return (
        <div className="space-y-5">
          <div
            className="mx-auto mb-6 h-20 w-20 rounded-full shadow-md"
            style={{ background: `linear-gradient(140deg, ${opt.c1}, ${opt.c2})` }}
          />
          <ResultHeadline
            className="text-center"
            headline={data.aiFeedback ? data.aiFeedback.headline : `${opt.label}.`}
            narrative={
              data.aiFeedback ? (
                data.aiFeedback.narrative
              ) : (
                <>
                  Noted. Today felt <b className="font-bold text-plum-500">{opt.label.toLowerCase()}</b>. That's a tile on your moodboard now. The pattern across days tells the real story.
                </>
              )
            }
          />
        </div>
      );
    }

    // 2. Values results layout
    if (data.kind === 'values' && data.top) {
      return (
        <div className="space-y-5">
          <ResultHeadline
            headline={
              data.aiFeedback ? (
                data.aiFeedback.headline
              ) : (
                <>
                  You lead with <em className="italic text-plum-500">{data.top[0]}</em>.
                </>
              )
            }
            narrative={data.aiFeedback ? data.aiFeedback.narrative : (VALUE_DESC[data.top[0]] || '')}
          />

          {!data.aiFeedback && data.top[1] && (
            <InsightBlock
              borderColor="var(--color-plum-500)"
              label="Your second value"
              text={
                <>
                  <b className="font-bold text-ink-900">{data.top[1]}</b>: {VALUE_DESC[data.top[1]] || ''}
                </>
              }
            />
          )}

          <ShareCard accent={accent} accentTo={accentTo} cardRef={cardRef}>
            <h3 className="mb-3 font-display text-xs font-bold uppercase tracking-[0.16em] opacity-80">
              What matters most
            </h3>
            <div className="flex flex-col gap-2.5">
              {data.top.map((s, i) => (
                <div key={s} className="flex items-center gap-3 text-base font-bold">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-on-primary/20 text-xs font-bold">
                    {i + 1}
                  </span>
                  {s}
                </div>
              ))}
            </div>
            <p className="mt-5 text-2xs font-bold uppercase tracking-wider opacity-75">
              WellMindly · Discover
            </p>
          </ShareCard>
        </div>
      );
    }

    // 3. Signature strengths layout
    if (data.kind === 'strengths' && data.top && data.scores) {
      return (
        <div className="space-y-5">
          <ResultHeadline
            headline={
              data.aiFeedback ? (
                data.aiFeedback.headline
              ) : (
                <>
                  Your top <em className="italic text-plum-500">strengths.</em>
                </>
              )
            }
            narrative={
              data.aiFeedback
                ? data.aiFeedback.narrative
                : "These are the qualities you lead with. Leaning into your signature strengths, on purpose this week, is one of the most reliable ways to feel more like yourself."
            }
          />

          <ShareCard accent={accent} accentTo={accentTo} cardRef={cardRef}>
            <h3 className="mb-3 font-display text-xs font-bold uppercase tracking-[0.16em] opacity-80">
              My signature strengths
            </h3>
            <div className="flex flex-col gap-2.5">
              {data.top.map((s, i) => (
                <div key={s} className="flex items-center gap-3 text-base font-bold">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-on-primary/20 text-xs font-bold">
                    {i + 1}
                  </span>
                  {s}
                </div>
              ))}
            </div>
            <p className="mt-5 text-2xs font-bold uppercase tracking-wider opacity-75">
              WellMindly · Discover
            </p>
          </ShareCard>

          <RankingPanel title="Full ranking" ranked={ranked} tone={cur.tone} isWellbeing={isWellbeing} />
        </div>
      );
    }

    // 4. Character archetype / Type layout
    if (data.kind === 'type' && data.top && data.scores) {
      const topType = data.top[0];
      const typeInfo = cur.types?.[topType];
      return (
        <div className="space-y-5">
          <ResultHeadline
            headline={
              data.aiFeedback ? (
                data.aiFeedback.headline
              ) : (
                <>
                  {cur.reveal || 'You’re'} <em className="italic text-plum-500">{topType}</em>.
                </>
              )
            }
            narrative={data.aiFeedback ? data.aiFeedback.narrative : (typeInfo?.desc || '')}
          />

          {cur.card && (
            <ShareCard accent={accent} accentTo={accentTo} cardRef={cardRef}>
              <h3 className="mb-3 font-display text-xs font-bold uppercase tracking-[0.16em] opacity-80">
                {cur.cardLabel || 'My result'}
              </h3>
              <p className="mb-3 font-display text-4xl font-bold leading-tight">{topType}</p>
              <p className="mt-5 text-2xs font-bold uppercase tracking-wider opacity-75">
                {typeInfo?.tag || cur.title} · WellMindly
              </p>
            </ShareCard>
          )}

          {!data.aiFeedback && typeInfo?.a && (
            <InsightBlock borderColor="var(--color-teal-700)" label={typeInfo.a.label} text={typeInfo.a.text} />
          )}
          {!data.aiFeedback && typeInfo?.b && (
            <InsightBlock borderColor="var(--color-coral-700)" label={typeInfo.b.label} text={typeInfo.b.text} />
          )}

          <RankingPanel title="How it broke down" ranked={ranked} tone={cur.tone} isWellbeing={isWellbeing} />
        </div>
      );
    }

    // 5. Big Five personality layout
    if (data.kind === 'bigfive' && data.archetype && data.scores) {
      const arch = data.archetype;
      return (
        <div className="space-y-5">
          <ResultHeadline
            headline={
              data.aiFeedback ? (
                data.aiFeedback.headline
              ) : (
                <>
                  You're <em className="italic text-plum-500">{arch.name}</em>.
                </>
              )
            }
            narrative={data.aiFeedback ? data.aiFeedback.narrative : arch.desc}
          />

          <ShareCard accent={accent} accentTo={accentTo} cardRef={cardRef}>
            <h3 className="mb-3 font-display text-xs font-bold uppercase tracking-[0.16em] opacity-80">
              My personality archetype
            </h3>
            <p className="mb-3 font-display text-4xl font-bold leading-tight">{arch.name}</p>
            <p className="mt-5 text-2xs font-bold uppercase tracking-wider opacity-75">
              WellMindly · Discover
            </p>
          </ShareCard>

          <RankingPanel title="Your five traits" ranked={ranked} tone={cur.tone} isWellbeing={isWellbeing} />
        </div>
      );
    }

    // 6/7. The two check-ins (kind "phq9" = Wellbeing check-in, kept as a
    // persisted discriminant; kind "checkin" = Emotional check-in). One layout:
    // band chip + score, then fixed copy for that band (lib/checkinCopy.ts).
    if ((data.kind === 'phq9' || data.kind === 'checkin') && data.scores && copy) {
      const chipTone =
        copy.band === 'steady' ? 'text-sage-700 bg-sage-50 border-sage-200'
        : copy.band === 'okay' ? 'text-gold-700 bg-gold-50 border-gold-200'
        : copy.band === 'low' ? 'text-coral-700 bg-coral-50 border-coral-200'
        : 'text-rose-700 bg-rose-50 border-rose-200';
      return (
        <div className="space-y-5">
          <div className="flex items-end justify-between gap-4 rounded-2xl border border-ink-200/70 bg-ink-50 p-5">
            <div>
              <span className="mb-1.5 block text-2xs font-bold uppercase tracking-widest text-ink-400">
                Where this sits
              </span>
              <span className={`inline-flex items-center rounded-xl border px-3 py-1.5 text-xs font-bold ${chipTone}`}>
                {copy.label}
              </span>
            </div>
            {typeof checkinTotal === 'number' && checkinMax ? (
              <div className="text-right">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black tracking-tighter text-ink-900">{checkinTotal}</span>
                  <span className="text-sm font-bold text-ink-400">/ {checkinMax}</span>
                </div>
                <span className="text-2xs font-semibold text-ink-400">
                  {isWellbeing ? 'lower is lighter' : 'higher is better'}
                </span>
              </div>
            ) : null}
          </div>

          <ResultHeadline headline={copy.headline} narrative={copy.narrative} />

          {copy.supportFirst && (
            <div className="flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
              <LifeBuoy className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
              <p className="text-sm leading-relaxed">
                You don't have to wait until it gets worse to talk to someone. A counselor or
                a peer on TalkMindly is a tap away below, and if you need someone right now,{" "}
                <Link to="/crisis" className="font-semibold underline hover:text-rose-900">
                  free helplines are here
                </Link>
                .
              </p>
            </div>
          )}

          <RankingPanel title="Your dimensions" ranked={ranked} tone={cur.tone} isWellbeing={isWellbeing} emotional={data.kind === 'checkin'} />
        </div>
      );
    }

    return null;
  };

  return (
    <Card
      ref={reportRef}
      id="printable-report-card"
      padding="lg"
      elevation="floating"
      className="space-y-6 overflow-hidden"
    >
      {/* Printable page header */}
      <div className="mb-6 hidden border-b border-ink-200 pb-4 print:block">
        <h1 className="font-display text-2xl font-bold text-ink-900">WellMindly</h1>
        <p className="text-xs font-bold uppercase tracking-wider text-ink-500">{cur.title} Assessment Report</p>
      </div>

      {/* category badge */}
      <div className="no-print flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent }} />
          <span className="text-xs font-bold uppercase tracking-wider text-ink-500">{cur.title}</span>
        </div>
        <span className="rounded-full border border-line bg-paper-2 px-3 py-1 text-2xs font-bold text-ink-500">
          {cur.tag || '~2 min'}
        </span>
      </div>

      {/* Main Layout Content */}
      {renderContent()}

      {/* What stood out */}
      {insights.length > 0 && (
        <Card elevation="sunken" padding="md">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-plum-600">What stood out</h4>
          <ul className="space-y-3 text-sm font-medium text-ink-600">
            {insights.map((ins, idx) => (
              <li key={idx} className="flex items-start gap-3 leading-relaxed">
                <Sparkle className="mt-0.5 h-4 w-4 shrink-0 text-plum-500" aria-hidden="true" />
                <span>{ins}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Action Tip */}
      {tipText && <InsightBlock borderColor={accent} label="Try this next" text={tipText} />}

      {/* Post-Assessment Feedback Questionnaire */}
      {data.resultId && showFeedback && (
        <div className="no-print">
          <FeedbackForm resultId={data.resultId} onComplete={() => setShowFeedback(false)} />
        </div>
      )}

      {/* What you can do next: the three services */}
      {onComingSoonClick && (
        <NextSteps supportFirst={!!copy?.supportFirst} onOpen={onComingSoonClick} />
      )}

      {/* Trajectory History Timeline */}
      {historyAttempts.length > 0 && (
        <Card elevation="sunken" padding="md" className="no-print space-y-4">
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            aria-expanded={showHistory}
            className="flex w-full items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-plum-500/12 rounded-lg"
          >
            <span className="text-sm font-semibold text-ink-800">
              Your past results
              <span className="ml-2 text-xs font-medium text-ink-400">
                {historyAttempts.length} {historyAttempts.length === 1 ? 'time' : 'times'}
              </span>
            </span>
            <ChevronDown className={`h-4 w-4 text-ink-400 transition-transform ${showHistory ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
          {showHistory && (<>

          {trendInfo && (
            <p className="rounded-xl border border-plum-100 bg-plum-50 p-3.5 text-sm font-semibold italic leading-relaxed text-ink-600">
              {trendInfo}
            </p>
          )}

          <div className="relative space-y-5 border-l-2 border-line py-2 pl-6">
            {(showAllAttempts ? displayAttempts : displayAttempts.slice(0, 5)).map((att: any, idx: number) => {
              const d = new Date(att.date);
              const isLatest = idx === 0;
              const originalIdx = historyAttempts.length - 1 - idx;
              const prevAtt = originalIdx > 0 ? historyAttempts[originalIdx - 1] : null;
              const diff = prevAtt && att.score !== undefined && prevAtt.score !== undefined
                ? att.score - prevAtt.score
                : null;

              // Direction matters: on this instrument a LOWER score is the
              // better week, the opposite of every other test here. This read
              // `cur.title.includes("phq")`, which the rename turns false - and
              // a false value silently flips the arrow, so a student getting
              // worse would have been shown "improving".
              const isImprovement = diff !== null && (isWellbeing ? diff < 0 : diff > 0);
              const isWorse = diff !== null && (isWellbeing ? diff > 0 : diff < 0);
              return (
                <div key={att.id || idx} className="relative">
                  {/* Timeline Dot */}
                  <div className={`absolute left-[-31px] top-1.5 h-2.5 w-2.5 rounded-full border-2 bg-card ${isLatest ? 'border-plum-500 scale-125 shadow-md shadow-plum-500/20' : 'border-ink-200'}`} />

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold leading-tight text-ink-900">
                        {displayClassification(att.quizTitle, att.classification, att.score) ||
                          'Completed'}
                        {isLatest && <span className="ml-2.5 rounded-full bg-plum-500 px-2 py-0.5 text-2xs font-bold uppercase tracking-wider text-on-primary">Latest</span>}
                      </p>
                      <p className="mt-0.5 text-2xs font-semibold text-ink-500">
                        {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    {instrumentIsScored && typeof att.score === 'number' && att.maxScore > 0 && att.score <= att.maxScore && (
                      <span className="flex items-center gap-1.5 rounded-lg border border-line bg-paper-2 px-2.5 py-0.5 text-xs font-bold text-ink-600">
                        Score: {att.score} / {att.maxScore}
                        {diff !== null && diff !== 0 && (
                          <span className={`rounded px-1.5 py-0.5 text-2xs font-bold ${
                            isImprovement ? 'border border-sage-200 bg-sage-50 text-sage-700' :
                            isWorse ? 'border border-rose-200 bg-rose-50 text-rose-700' :
                            'border border-ink-200 bg-ink-50 text-ink-600'
                          }`}>
                            {diff > 0 ? `+${diff}` : diff}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {displayAttempts.length > 5 && (
            <div className="flex justify-center border-t border-line pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowAllAttempts(!showAllAttempts)}>
                {showAllAttempts ? "Show less" : `Show all attempts (${displayAttempts.length})`}
              </Button>
            </div>
          )}
          </>)}
        </Card>
      )}

      {/* Nav row */}
      <div className="no-print mt-8 flex flex-wrap items-center justify-between gap-3.5 border-t border-line/40 pt-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onRetake}>Take again</Button>
          <Button
            variant="outline"
            onClick={async () => {
              const { downloadAssessmentPdf } = await import("./assessmentPdf");
              await downloadAssessmentPdf({
                title: cur.title,
                category: cur.tag?.split(" · ")[0],
                // Only the two check-ins have a real total; the rest post a
                // placeholder 100, so no score is printed for them.
                score: copy && typeof checkinTotal === "number" ? checkinTotal : undefined,
                maxScore: copy ? checkinMax : undefined,
                lowerIsBetter: isWellbeing,
                classification: copy?.label,
                headline: copy?.headline ?? data.aiFeedback?.headline,
                narrative: copy?.narrative ?? data.aiFeedback?.narrative,
                tip: tipText,
                insights,
                dimensions: ranked.length ? ranked : undefined,
                dimensionWord: (v: number) =>
                  isWellbeing ? frequencyLabel(v) : data.kind === "checkin" ? checkinDimWord(v) : toneWord(v),
              });
              trackEvent("report_downloaded");
              // downloadAssessmentPdf already produces the file (browser download on
              // web, OS share sheet on native). The old window.print() ran a second,
              // redundant browser print dialog on top of it - and did nothing useful
              // in the Android WebView. Removed so one tap = one clear action.
            }}
            leadingIcon={<Printer className="h-4 w-4" />}
          >
            Save PDF
          </Button>
        </div>
        <Button variant="ghost" onClick={() => goTo('hub')} trailingIcon={<ArrowRight />}>
          Explore more tests
        </Button>
      </div>
    </Card>
  );
}

// ─── Layout Helper: Headline + Narrative ──────────────────────────
/** The headline + narrative pair every result layout opens with. */
function ResultHeadline({
  headline,
  narrative,
  className,
}: {
  headline: React.ReactNode;
  narrative: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <h2 className="font-display text-xl font-semibold leading-tight text-ink-900 sm:text-2xl">
        {headline}
      </h2>
      <p className="mt-1.5 text-sm font-medium leading-relaxed text-ink-600 sm:text-base">
        {narrative}
      </p>
    </div>
  );
}

// ─── Layout Helper: Inset Ranking Panel ────────────────────────────
/** The inset "here is how it broke down" panel. Five layouts render one. */
function RankingPanel({
  title,
  ranked,
  tone,
  isWellbeing,
  emotional,
}: {
  title: string;
  ranked: [string, number][];
  tone: TestTone;
  isWellbeing?: boolean;
  emotional?: boolean;
}) {
  return (
    <Card elevation="sunken" padding="md">
      <p className="mb-4 border-b border-line/45 pb-2 text-xs font-bold uppercase tracking-widest text-ink-600">
        {title}
      </p>
      <div className="flex flex-col gap-4">
        {ranked.map(([label, value]) => (
          <ProgressBar
            key={label}
            size="md"
            value={value}
            tone={dimTone(value, isWellbeing, tone)}
            label={label}
            valueText={isWellbeing ? frequencyLabel(value) : emotional ? checkinDimWord(value) : toneWord(value)}
          />
        ))}
      </div>
    </Card>
  );
}

/**
 * The wellbeing check-in colours its bars by severity, not by the test's own
 * ramp: more of these days is a warmer bar. Every other test uses the ramp.
 * Replaces the legacy 4-tier severity bar with design system tone ramps.
 */
function dimTone(value: number, isWellbeing: boolean | undefined, fallback: TestTone): TestTone {
  if (!isWellbeing) return fallback;
  if (value >= 75) return "coral";
  if (value >= 55) return "rose";
  if (value >= 35) return "gold";
  return "sage";
}

// ─── Layout Helper: Svg Icons Share Card ──────────────────────────
function ShareCard({
  accent,
  accentTo,
  children,
  cardRef,
}: {
  accent: string;
  accentTo?: string;
  children: React.ReactNode;
  cardRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-2xl p-6 text-on-primary shadow-xl sm:p-8"
      style={{ background: `linear-gradient(135deg, ${accent}, ${accentTo || accent})` }}
    >
      {children}
    </div>
  );
}

// ─── Layout Helper: Insight Block ──────────────────────────────────
function InsightBlock({
  borderColor,
  label,
  text,
}: {
  borderColor: string;
  label: React.ReactNode;
  text: React.ReactNode;
}) {
  return (
    <div
      className="my-3 rounded-r-xl border-y border-r border-line border-l-3 bg-paper-2 p-5 text-sm font-medium text-ink-600 shadow-sm"
      style={{ borderColor }}
    >
      <h4 className="mb-1 text-xs font-bold uppercase tracking-wider" style={{ color: borderColor }}>
        {label}
      </h4>
      {text}
    </div>
  );
}
