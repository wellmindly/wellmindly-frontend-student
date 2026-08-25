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

/** One completed quiz result, as the results timeline reports it. */
export interface TimelinePoint {
  id: string;
  date: string;
  score: number;
  maxScore: number;
  /** Already rounded 0–100 by the backend. */
  percentage: number;
  classification: string;
  aiFeedback: string | null;
  answers: Record<string, number> | null;
  quizTitle: string;
  quizCategory: string;
}

export interface LatestResult {
  score: number;
  maxScore: number;
  classification: string;
  aiFeedback: string | null;
  answers: Record<string, number> | null;
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
