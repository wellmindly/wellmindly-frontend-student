import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, LifeBuoy, MessageCircle, Sparkle } from "lucide-react";
import { rankDims, toneWord, VALUE_DESC } from "./types";
import {
  bandForResult,
  isWellbeingCheckin,
  displayClassification,
  frequencyLabel,
  WELLBEING_MAX_SCORE,
  WELLBEING_TITLE,
} from "../../lib/wellbeing";
import type { TestDef, PictureOption, TestTone } from "./types";
import { FeedbackForm } from "./FeedbackForm";
import { Button, Card, ProgressBar } from "../ui";

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
    aiFeedback?: { headline: string; narrative: string; tip: string; insights?: string[] } | null;
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
  const ranked = data.scores ? rankDims(data.scores) : [];

  const isWellbeing = isWellbeingCheckin(cur.title);

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
    if (!isWellbeing || historyAttempts.length < 2) return null;
    const currentAttempt = historyAttempts[historyAttempts.length - 1];
    const prevAttempt = historyAttempts[historyAttempts.length - 2];
    
    if (currentAttempt.score !== undefined && prevAttempt.score !== undefined) {
      const diff = currentAttempt.score - prevAttempt.score;
      if (diff < 0) {
        return `Down ${Math.abs(diff)} points since your last check-in, with fewer difficult days than last time.`;
      } else if (diff > 0) {
        return `Up ${diff} points since your last check-in. More of these days than last time; that is worth noticing, not fixing today.`;
      } else {
        return `Same score as your last check-in.`;
      }
    }
    return null;
  }, [historyAttempts, isWellbeing]);

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

    // 6. Wellbeing check-in report layout.
    // `kind` stays "phq9" because it is a persisted discriminant (see the note
    // on TESTS.phq9 in types.ts); nothing here says PHQ-9 to the student.
    if (data.kind === 'phq9' && data.scores) {
      const currentAttempt = historyAttempts[historyAttempts.length - 1];
      const totalScore = currentAttempt?.score ?? 0;
      const band = bandForResult(totalScore, currentAttempt?.classification);

      return (
        <div className="space-y-5">
          <div className="flex justify-between items-end bg-ink-50 border border-ink-200/70 rounded-2xl p-5 shadow-sm">
            <div>
              <span className="text-2xs font-black text-ink-400 uppercase tracking-widest block mb-1.5">
                Where this sits
              </span>
              <span className="inline-flex items-center justify-center text-xs font-bold px-3 py-1.5 rounded-xl border text-plum bg-plum-50 border-plum-200/70">
                {band.label}
              </span>
            </div>
            <div className="text-right">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-ink-900 tracking-tighter">{totalScore}</span>
                <span className="text-sm font-bold text-ink-400">/ {WELLBEING_MAX_SCORE}</span>
              </div>
            </div>
          </div>

          <ResultHeadline
            headline={data.aiFeedback ? data.aiFeedback.headline : WELLBEING_TITLE}
            narrative={data.aiFeedback ? data.aiFeedback.narrative : band.support}
          />

          {/* Top band only. Before this there was no crisis path wired to a
              score anywhere in the app - a student could be handed the highest
              result the instrument produces and offered nothing. */}
          {band.showCrisisLink && (
            <div className="flex gap-3 rounded-2xl border border-rose-200/70 bg-rose-50 p-4 text-rose-800">
              <LifeBuoy className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs font-semibold leading-relaxed">
                If you want to talk to someone right now,{" "}
                <Link to="/crisis" className="underline font-bold hover:text-rose-900">
                  crisis support and hotlines are here
                </Link>
                . You can also book a session with a counselor from your dashboard.
              </p>
            </div>
          )}

          <RankingPanel title="Your dimensions" ranked={ranked} tone={cur.tone} isWellbeing={isWellbeing} />
        </div>
      );
    }

    // 7. Wellness Check-in report layout
    if (data.kind === 'checkin' && data.scores) {
      const avg = Object.values(data.scores).reduce((a, b) => a + b, 0) / Object.values(data.scores).length;
      const tone = avg >= 70 ? "You're doing well." : avg >= 45 ? "Finding your footing." : "A heavier stretch.";
      return (
        <div className="space-y-5">
          <ResultHeadline
            headline={data.aiFeedback ? data.aiFeedback.headline : tone}
            narrative={
              data.aiFeedback
                ? data.aiFeedback.narrative
                : "This is a snapshot, not a score. Use it to notice how your weeks shift. The patterns over time tell a richer story than any single check-in."
            }
          />

          <RankingPanel title="Your dimensions" ranked={ranked} tone={cur.tone} isWellbeing={isWellbeing} />
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

      {/* Dynamic Observations list */}
      {data.aiFeedback?.insights && data.aiFeedback.insights.length > 0 && (
        <Card elevation="sunken" padding="md">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-plum-600">Key Observations</h4>
          <ul className="space-y-3 text-sm font-medium text-ink-600">
            {data.aiFeedback.insights.map((ins, idx) => (
              <li key={idx} className="flex items-start gap-3 leading-relaxed">
                <Sparkle className="mt-0.5 h-4 w-4 shrink-0 text-plum-500" aria-hidden="true" />
                <span>{ins}</span>
              </li>
            ))}
          </ul>
        </Card>
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
        <Card elevation="sunken" padding="md" className="no-print space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-plum-600">Your Check-in History</h4>
            <span className="rounded-full bg-paper-2 px-2.5 py-0.5 text-2xs font-bold text-ink-600">
              {historyAttempts.length} {historyAttempts.length === 1 ? 'Attempt' : 'Attempts'}
            </span>
          </div>

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
                    {att.score !== undefined && (
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
        </Card>
      )}

      {/* Post-Assessment Feedback Questionnaire */}
      {data.resultId && showFeedback && (
        <div className="no-print mb-6">
          <FeedbackForm resultId={data.resultId} onComplete={() => setShowFeedback(false)} />
        </div>
      )}

      {/* Connected services CTAs */}
      {onComingSoonClick && (
        <Card elevation="sunken" padding="md" className="no-print space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-plum-600">Connected Services</h4>
          <p className="text-xs font-medium leading-relaxed text-ink-600">
            Need to talk through these insights or find support?
          </p>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Button variant="outline" fullWidth onClick={() => onComingSoonClick('talkmindly')} leadingIcon={<MessageCircle />}>
              TalkMindly
            </Button>
            <Button variant="outline" fullWidth onClick={() => onComingSoonClick('sessionbooking')} leadingIcon={<CalendarDays />}>
              Book a session
            </Button>
          </div>
        </Card>
      )}

      {/* Nav row */}
      <div className="no-print mt-8 flex flex-wrap items-center justify-between gap-3.5 border-t border-line/40 pt-4">
        <Button variant="outline" onClick={onRetake}>Take again</Button>
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
      <h2 className="font-display text-2xl font-medium leading-tight text-ink-900 sm:text-3xl">
        {headline}
      </h2>
      <p className="mt-1 font-display text-lg font-medium leading-relaxed text-ink-600">
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
}: {
  title: string;
  ranked: [string, number][];
  tone: TestTone;
  isWellbeing?: boolean;
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
            valueText={isWellbeing ? frequencyLabel(value) : toneWord(value)}
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
      className="relative overflow-hidden rounded-2xl p-8 text-on-primary shadow-xl"
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
