import {
  MessagesSquare,
  CalendarCheck,
  NotebookPen,
  ArrowRight,
} from "lucide-react";
import { ActionCard, Badge } from "../../ui";
import { cn } from "../../../lib/cn";
import { config } from "../../../config";

export interface QuickActionsProps {
  onComingSoonClick?: (feature: "writemindly" | "talkmindly" | "sessionbooking") => void;
}

const ACTIONS = [
  {
    id: "talkmindly" as const,
    tone: "gold" as const,
    icon: MessagesSquare,
    iconClass: "bg-gold-100 text-gold-700",
    ctaClass: "text-gold-700",
    eyebrow: "Peer board",
    title: "TalkMindly Space",
    body: "Post under a nickname and read what other students are going through. Other students see the nickname, not your name.",
    cta: "Open the board",
  },
  {
    id: "sessionbooking" as const,
    tone: "teal" as const,
    icon: CalendarCheck,
    iconClass: "bg-teal-100 text-teal-700",
    ctaClass: "text-teal-700",
    eyebrow: "1-on-1",
    title: "Book a Session",
    body: "Pick a time with a counselor from the list. You get a meeting link once it's confirmed.",
    cta: "See available slots",
  },
  {
    id: "writemindly" as const,
    tone: "primary" as const,
    icon: NotebookPen,
    iconClass: "bg-plum-100 text-plum",
    ctaClass: "text-plum",
    eyebrow: "Journal",
    title: "WriteMindly Journal",
    body: "Guided prompts for writing about your day, one question at a time.",
    cta: config.enableWriteMindly ? "Start writing" : "Join the waitlist",
  },
];

export function QuickActions({ onComingSoonClick }: QuickActionsProps) {
  return (
    <section aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className="sr-only">
        Quick Support Actions
      </h2>

      <ul role="list" className="grid gap-4 sm:gap-6 md:grid-cols-3">
        {ACTIONS.map((action) => {
          const isWriteMindlyComingSoon =
            action.id === "writemindly" && !config.enableWriteMindly;
          const badgeTone = isWriteMindlyComingSoon ? "neutral" : action.tone;
          const eyebrowText = isWriteMindlyComingSoon ? "Coming soon" : action.eyebrow;

          return (
            <li key={action.id} className="h-full">
              <ActionCard
                tone="default"
                padding="md"
                onClick={() => onComingSoonClick?.(action.id)}
                className="flex h-full min-h-[11rem] flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center",
                        action.iconClass
                      )}
                    >
                      <action.icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <Badge tone={badgeTone} size="sm">
                      {eyebrowText}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold font-serif text-ink-900 mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-ink-600 leading-relaxed">
                    {action.body}
                  </p>
                </div>

                <div
                  className={cn(
                    "mt-4 flex items-center gap-1.5 text-sm font-semibold",
                    action.ctaClass
                  )}
                >
                  <span>{action.cta}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </div>
              </ActionCard>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
