import { ArrowRight, CalendarDays, MessageCircle, PenLine } from "lucide-react";
import { trackEvent } from "../../lib/analytics";

type Feature = "writemindly" | "talkmindly" | "sessionbooking";

interface Service {
  id: Feature;
  title: string;
  line: string;
  chip: string;
  icon: React.ReactNode;
  /** Solid tints, not /opacity colours, so older Android WebViews render them. */
  tile: string;
  ring: string;
}

const SERVICES: Record<Feature, Service> = {
  writemindly: {
    id: "writemindly",
    title: "WriteMindly",
    line: "Get it out of your head. Write it down and the AI helps you make sense of it.",
    chip: "Private · AI reflection",
    icon: <PenLine className="h-5 w-5" aria-hidden="true" />,
    tile: "bg-plum-50 text-plum-700",
    ring: "hover:border-plum-300 focus-visible:border-plum-400",
  },
  talkmindly: {
    id: "talkmindly",
    title: "TalkMindly",
    line: "Post anonymously and see you're not the only one feeling this way.",
    chip: "Anonymous · Students like you",
    icon: <MessageCircle className="h-5 w-5" aria-hidden="true" />,
    tile: "bg-teal-50 text-teal-700",
    ring: "hover:border-teal-300 focus-visible:border-teal-400",
  },
  sessionbooking: {
    id: "sessionbooking",
    title: "Talk to a counselor",
    line: "Book a 1-on-1 session with a real counselor, at a time that works for you.",
    chip: "1-on-1 · Confidential",
    icon: <CalendarDays className="h-5 w-5" aria-hidden="true" />,
    tile: "bg-coral-50 text-coral-700",
    ring: "hover:border-coral-300 focus-visible:border-coral-400",
  },
};

/**
 * The three things a student can do after a result. Replaces the old
 * "Connected Services" box (two outline buttons, one line of copy). When the
 * result is in the lowest band, the human options lead.
 */
export function NextSteps({
  supportFirst,
  onOpen,
}: {
  supportFirst: boolean;
  onOpen: (feature: Feature) => void;
}) {
  const order: Feature[] = supportFirst
    ? ["sessionbooking", "talkmindly", "writemindly"]
    : ["writemindly", "talkmindly", "sessionbooking"];

  return (
    <section className="no-print space-y-4" aria-labelledby="next-steps-title">
      <div>
        <h4 id="next-steps-title" className="font-display text-lg font-semibold text-ink-900">
          {supportFirst ? "You don't have to carry this alone" : "Don't stop at the result"}
        </h4>
        <p className="mt-1 text-sm text-ink-500">
          {supportFirst
            ? "Pick whichever feels easiest right now."
            : "Three ways to actually do something with how you're feeling."}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {order.map((id, i) => {
          const s = SERVICES[id];
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                trackEvent("result_next_step", { service: id, position: i + 1 });
                onOpen(id);
              }}
              className={`group flex items-start gap-3 rounded-2xl border border-ink-200 bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-plum-500/12 sm:flex-col ${s.ring}`}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.tile}`}>
                {s.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-ink-900">{s.title}</span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5 sm:hidden"
                    aria-hidden="true"
                  />
                </span>
                <span className="mt-1 block text-sm leading-snug text-ink-600">{s.line}</span>
                <span className="mt-2 inline-block text-2xs font-semibold uppercase tracking-wider text-ink-400">
                  {s.chip}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
