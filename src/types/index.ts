export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'ADMIN' | 'UNIVERSITY';
  universityId: string | null;
  universityDomain: string | null;
  universityVerified: boolean;
}

