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
