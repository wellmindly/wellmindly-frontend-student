/* ============================================================================
   Shapes returned by the student endpoints. Read off the backend, not guessed:
     GET /api/students/me/daily-checkins  → { checkins: DailyCheckinRow[] }
     GET /api/students/me/results         → ResultsData
   backend/src/routes/students.ts, and backend/prisma/schema.prisma for the row.
   ========================================================================= */

/** One row of `DailyCheckin`. There is no note field and no `updatedAt`. */
export interface DailyCheckinRow {
  id: string;
  userId: string;
  rating: number;
  createdAt: string;
}

/** The AI feedback object stored inside the `classification` JSON column.
    Mirror of `QuizFeedback` in backend/src/utils/ai.ts:33. `insights` is
    optional here because rows written before that field existed omit it. */
export interface QuizAiFeedback {
  headline: string;
  narrative: string;
  tip: string;
  insights?: string[];
}

/** Whatever the client posted at submit time. `quizzes.ts:232` falls back to
    the whole request body, so nothing here is guaranteed - narrow at the read
    site rather than trusting the type. */
export interface StoredAnswers {
  /** Per-question values, already normalised 0-100 when present. */
  scores?: Record<string, number>;
  [key: string]: unknown;
}

/** One completed quiz result, as the results timeline reports it. */
export interface TimelinePoint {
  id: string;
  date: string;
  score: number;
  maxScore: number;
  /** Already rounded 0–100 by the backend. */
  percentage: number;
  classification: string;
  aiFeedback: QuizAiFeedback | null;
  answers: StoredAnswers | null;
  quizTitle: string;
  quizCategory: string;
}

export interface LatestResult {
  score: number;
  maxScore: number;
  classification: string;
  aiFeedback: QuizAiFeedback | null;
  answers: StoredAnswers | null;
  date: string;
  quizTitle: string;
}

export interface ResultsData {
  userId: string;
  totalAttempts: number;
  averageScore: number;
  latestResult: LatestResult | null;
  timeline: TimelinePoint[];
  distribution: Record<string, number>;
  quizBreakdown: unknown[];
}
