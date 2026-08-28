export interface TalkRoom {
  id: string;
  name: string;
  description: string;
}

export interface TalkReply {
  id: string;
  isMine: boolean;
  nickname: string;
  avatar: string;
  content: string;
  status: string;
  moderationReason: string | null;
  createdAt: string;
}

export interface TalkReaction {
  id: string;
  isMine: boolean;
  type: string;
}

export interface TalkNote {
  id: string;
  isMine: boolean;
  nickname: string;
  avatar: string;
  content: string;
  status: string;
  moderationReason: string | null;
  meTooCount: number;
  createdAt: string;
  replies: TalkReply[];
  reactions: TalkReaction[];
}

export interface TalkProfile {
  talkNickname: string | null;
  talkAvatar: string | null;
  talkBio: string | null;
  talkTermsAccepted: boolean;
}

// Avatar emoji are persisted product data (User.talkAvatar), not decorative
// glyphs - converting them to icons would orphan existing profiles. T-602.
export const AVATARS = [
  { id: "panda", emoji: "🐼", name: "Panda" }, // guard-ignore
  { id: "fox", emoji: "🦊", name: "Fox" }, // guard-ignore
  { id: "owl", emoji: "🦉", name: "Owl" }, // guard-ignore
  { id: "koala", emoji: "🐨", name: "Koala" }, // guard-ignore
  { id: "rabbit", emoji: "🐰", name: "Rabbit" }, // guard-ignore
  { id: "tiger", emoji: "🐯", name: "Tiger" }, // guard-ignore
  { id: "bear", emoji: "🐻", name: "Bear" }, // guard-ignore
  { id: "lion", emoji: "🦁", name: "Lion" }, // guard-ignore
  { id: "cat", emoji: "🐱", name: "Cat" }, // guard-ignore
  { id: "frog", emoji: "🐸", name: "Frog" } // guard-ignore
];

export const ADJECTIVES = [
  "Quiet", "Steady", "Peaceful", "Gentle", "Kind", "Warm",
  "Calm", "Soft", "Thoughtful", "Friendly", "Brave", "Joyful"
];

// A civility pre-check, not moderation. The server's AI safety pass
// (`evaluateContentSafety`) is the real filter and it reads context; this list
// only catches slurs and abuse where the word alone is enough to be sure.
// Clinical and anatomical language is deliberately absent: a student
// disclosing assault, sexuality or a body they are struggling with must not be
// told their words are unfriendly. See B-044.
const BANNED_WORDS = [
  "fuck", "shit", "bitch", "asshole", "bastard", "cunt",
  "nigger", "retard", "faggot", "whore", "slut",
];

export const containsProfanity = (text: string): boolean => {
  const lower = text.toLowerCase();
  return BANNED_WORDS.some((word) =>
    new RegExp(`\\b${word}`, "i").test(lower),
  );
};

export const getAvatarEmoji = (avId: string) => {
  return AVATARS.find((a) => a.id === avId)?.emoji || "🐼"; // guard-ignore
};
