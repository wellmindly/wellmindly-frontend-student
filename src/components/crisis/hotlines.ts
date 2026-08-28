import type { BadgeTone } from "../ui/Badge";

export interface CrisisHotline {
  id: string;
  name: string;
  description: string;
  phone: string;
  website: string;
  category: string;
  country: string;
}

export const CATEGORY_TONE_MAP: Record<string, BadgeTone> = {
  "Crisis & Suicide Support": "coral",
  "Mental Health": "teal",
  "Youth Support": "gold",
  "Domestic Violence": "rose",
  "LGBTQ+ Support": "primary",
  "Veterans Support": "sage",
  "Substance Abuse": "neutral",
};
