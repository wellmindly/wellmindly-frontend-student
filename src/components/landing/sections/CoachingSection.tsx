import * as React from "react";
import { motion } from "framer-motion";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";
import type { CoachItem } from "./types";
import { Button, Card, Avatar, EmptyState, ErrorState, SkeletonCard } from "../../ui";

export interface CoachingSectionProps {
  coaches: CoachItem[];
  onSelectCoach: (coach: CoachItem) => void;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

export function CoachingSection({
  coaches,
  onSelectCoach,
  loading = false,
  error = false,
  onRetry,
}: CoachingSectionProps) {
  return (
    <section className="py-16 sm:py-20 border-t border-ink-200/60" id="coaching-section">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center max-w-2xl mx-auto mb-10"
      >
        <span className="text-2xs font-bold text-plum-600 uppercase tracking-wide block mb-3">
          With a human
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink-900 text-balance">
          Talk to someone who gets it
        </h2>
        <p className="text-base text-ink-600 max-w-2xl text-pretty mt-3 mx-auto">
          When you'd rather talk it through, book a confidential session with a trained student coach.
        </p>
      </motion.div>

      {error ? (
        <ErrorState
          title="We couldn't load coaches"
          description="Check your connection and try again."
          onRetry={onRetry}
          className="my-8"
        />
      ) : loading ? (
        <div aria-busy="true" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} className="h-64 rounded-3xl" />
          ))}
        </div>
      ) : coaches.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" aria-hidden="true" />}
          title="No coaches available"
          description="Please check back later or explore other support options."
          className="my-8"
        />
      ) : (
        <CoachCarousel coaches={coaches} onSelectCoach={onSelectCoach} />
      )}

      <p className="text-xs text-ink-500 text-center max-w-2xl mx-auto mt-8 leading-relaxed">
        Our coaches are trained peer mentors focused on wellbeing, stress relief, and academic resilience. Professional counseling guidance is provided whenever specialized support is needed.
      </p>
    </section>
  );
}

function CoachCarousel({
  coaches,
  onSelectCoach,
}: {
  coaches: CoachItem[];
  onSelectCoach: (coach: CoachItem) => void;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(coaches.length > 4);

  const checkScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
  }, []);

  React.useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll, coaches.length]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.9;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative group/carousel">
      {/* Navigation Header / Controls */}
      {coaches.length > 4 && (
        <div className="flex justify-end items-center gap-2 mb-4 px-1">
          <span className="text-2xs font-semibold text-ink-400 mr-1">
            Scroll to see all ({coaches.length})
          </span>
          <button
            type="button"
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            className="w-8 h-8 rounded-full border border-ink-200 bg-card/90 backdrop-blur-sm text-ink-700 flex items-center justify-center hover:bg-ink-100 hover:text-ink-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm focus-visible:outline-2 focus-visible:outline-plum-500 cursor-pointer"
            aria-label="Previous coaches"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            className="w-8 h-8 rounded-full border border-ink-200 bg-card/90 backdrop-blur-sm text-ink-700 flex items-center justify-center hover:bg-ink-100 hover:text-ink-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm focus-visible:outline-2 focus-visible:outline-plum-500 cursor-pointer"
            aria-label="Next coaches"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Carousel Track */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex snap-x snap-mandatory overflow-x-auto gap-5 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar scroll-smooth focus-visible:outline-none"
        tabIndex={0}
        role="region"
        aria-label="Counselor directory carousel"
      >
        {coaches.map((coach) => (
          <div
            key={coach.name}
            className="snap-start shrink-0 w-[80%] max-w-[300px] sm:w-[calc((100%-1.25rem)/2)] sm:max-w-none lg:w-[calc((100%-3.75rem)/4)] flex"
          >
            <div className="w-full h-full">
              <CoachCard coach={coach} onSelectCoach={onSelectCoach} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CoachCard({
  coach,
  onSelectCoach,
}: {
  coach: CoachItem;
  onSelectCoach: (coach: CoachItem) => void;
}) {
  return (
    <Card className="flex flex-col justify-between h-full p-6 rounded-3xl border-ink-200">
      <div>
        <div className="flex items-center gap-3.5 mb-4">
          <Avatar
            src={coach.avatarUrl}
            name={coach.name}
            initials={coach.init}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-ink-900 text-base leading-snug truncate">
              {coach.name}
            </h4>
            <p className="text-2xs text-ink-600 line-clamp-1">
              {coach.role}
            </p>
          </div>
        </div>

        {coach.specs && coach.specs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {coach.specs.slice(0, 3).map((s) => (
              <span
                key={s}
                className="bg-ink-100 text-ink-700 text-2xs font-semibold px-2.5 py-1 rounded-full"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-ink-100 mt-auto">
        <Button
          variant="primary"
          size="md"
          className="w-full justify-center min-h-11"
          onClick={() => onSelectCoach(coach)}
        >
          See availability
        </Button>
      </div>
    </Card>
  );
}
