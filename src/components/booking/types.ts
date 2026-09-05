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

/** Why a slot is not bookable. Sent by the server's slot generator. */
export type SlotUnavailableReason =
  | "SLOT_ALREADY_BOOKED"
  | "BLOCKED_BY_COUNSELOR"
  | "SLOT_IN_THE_PAST";

export interface Slot {
  startTime: string;
  endTime: string;
  counselorId: string;
  counselorName?: string;
  isAvailable: boolean;
  availableCount?: number;
  /** Absent when the slot is bookable. See services/slotGenerator on the API. */
  reason?: SlotUnavailableReason;
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
  /**
   * Why nobody is free, when `counselorIds` is empty. The three cases read very
   * differently to a student - an hour that has simply gone by is not the same
   * news as a fully subscribed one - so the row is labelled from this rather
   * than from the absence of ids.
   */
  unavailableReason?: SlotUnavailableReason;
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
