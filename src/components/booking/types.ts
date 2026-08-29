export interface Counselor {
  id: string;
  userId: string;
  name: string;
  credentials: string;
  specializations: string[];
  bio: string;
  avatarUrl: string;
  averageRating: number | null;
  totalReviews: number;
}

export interface Slot {
  startTime: string;
  endTime: string;
  counselorId: string;
  counselorName?: string;
  isAvailable: boolean;
  availableCount?: number;
}

/**
 * One bookable time on the chosen date, collapsed across counselors.
 *
 * The API answers per counselor, but the student picks a *time* first and a
 * person second - so everyone who is free at that exact time travels with the
 * option, and step two just maps these ids back to counselors.
 */
export interface SlotOption {
  startTime: string;
  endTime: string;
  /** Counselors with this slot free. Empty means the time exists but is taken. */
  counselorIds: string[];
}

export interface BookedSession {
  id: string;
  status: string;
  startTime: string;
  endTime?: string;
  meetingLink: string;
  counselor?: {
    user?: {
      firstName?: string;
      lastName?: string;
    };
  };
  studentFeedback?: any;
}
