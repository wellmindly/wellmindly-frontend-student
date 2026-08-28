/* ============================================================================
   WellMindly student UI kit
   ----------------------------------------------------------------------------
   Every student-facing surface composes from these. If a page needs a visual
   treatment that isn't here, add it here first - the previous codebase styled
   each page independently, which is why four different visual languages had
   drifted into the app.

   Import from the barrel:  import { Button, Card, Sheet } from "../ui";
   ========================================================================= */

export { Button, IconButton, buttonBase, buttonClasses } from "./Button";
export type { ButtonProps, ButtonSize, ButtonVariant, IconButtonProps } from "./Button";

export { Card, ActionCard, SectionHeader } from "./Card";
export type {
  CardProps,
  CardTone,
  CardElevation,
  ActionCardProps,
  SectionHeaderProps,
} from "./Card";

export { Badge, Chip, Avatar, Divider } from "./Badge";
export type { BadgeProps, BadgeTone, ChipProps, AvatarProps } from "./Badge";

export { Field, Input, Textarea, PasswordInput } from "./Field";
export type { InputProps, TextareaProps, PasswordInputProps } from "./Field";

export { Sheet, ConfirmSheet } from "./Sheet";
export type { SheetProps, ConfirmSheetProps } from "./Sheet";

export { ToastProvider, useToast } from "./Toast";
export type { ToastTone } from "./Toast";

export { Skeleton, SkeletonText, SkeletonCard, Loadable } from "./Skeleton";
export type { SkeletonProps } from "./Skeleton";

export { EmptyState, ErrorState } from "./EmptyState";
export type { EmptyStateProps, ErrorStateProps, EmptyTone } from "./EmptyState";

export { ProgressBar, ProgressRing, StepDots } from "./Progress";
export type { ProgressBarProps, ProgressRingProps, StepDotsProps, ProgressTone } from "./Progress";

export { SegmentedControl, Tabs, TabPanel } from "./SegmentedControl";
export type { TabOption } from "./SegmentedControl";

export { Logo } from "./Logo";
export type { LogoProps } from "./Logo";

export { SkipLink } from "./SkipLink";
export type { SkipLinkProps } from "./SkipLink";

export { CrisisBanner } from "./CrisisBanner";
export type { CrisisBannerProps } from "./CrisisBanner";

export { SocialLinks } from "./SocialLinks";
export type { SocialLinksProps, SocialPlatform } from "./SocialLinks";
