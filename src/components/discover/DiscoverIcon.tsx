import type { LucideIcon } from "lucide-react";
import {
  ClipboardCheck,
  CloudRain,
  CloudSun,
  Compass,
  Flower2,
  Heart,
  Scale,
  ShieldHalf,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";

/**
 * Name → component registry for the Discover engine.
 *
 * The names have to stay strings: they are data, living as `TestDef.icon` and
 * `PictureOption.ic` in types.ts, and `TESTS` is serialised into localStorage
 * results by key. So this is a lookup table rather than a set of direct
 * imports at each call site. Every key below is referenced from types.ts —
 * grep before removing one.
 *
 * Replaces a `Record<string, string>` of hand-drawn path markup.
 */
const ICONS: Record<string, LucideIcon> = {
  bloom: Flower2,
  clipboard: ClipboardCheck,
  cloud: CloudRain,
  cloudSun: CloudSun,
  compass: Compass,
  heart: Heart,
  scale: Scale,
  shield: ShieldHalf,
  spark: Sparkles,
  star: Star,
  zap: Zap,
};

interface DiscoverIconProps {
  name: string;
  className?: string;
  strokeWidth?: number;
}

/**
 * Decorative by contract: every call site in the Discover engine renders this
 * beside its own visible text label, so it is always aria-hidden. If a future
 * surface needs a *meaningful* icon, give it a real label there — do not add a
 * prop here to turn the hiding off.
 */
export function DiscoverIcon({ name, className, strokeWidth = 1.8 }: DiscoverIconProps) {
  const Icon = ICONS[name];
  if (!Icon) return null;
  return <Icon aria-hidden="true" className={className} strokeWidth={strokeWidth} />;
}
