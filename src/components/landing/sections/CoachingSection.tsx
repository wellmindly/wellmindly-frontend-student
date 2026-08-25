import { motion } from "framer-motion";
import { Users } from "lucide-react";
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
        <>
          {/* Mobile Snap Row */}
          <div className="flex md:hidden snap-x snap-mandatory overflow-x-auto gap-4 -mx-6 px-6 pb-4 no-scrollbar">
            {coaches.map((coach) => (
              <div
                key={coach.name}
                className="snap-start shrink-0 w-[80%] max-w-[300px]"
              >
                <CoachCard coach={coach} onSelectCoach={onSelectCoach} />
              </div>
            ))}
          </div>

          {/* Desktop Grid */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {coaches.map((coach) => (
              <div key={coach.name} className="h-full">
                <CoachCard coach={coach} onSelectCoach={onSelectCoach} />
              </div>
            ))}
          </div>
        </>
      )}

      <p className="text-xs text-ink-500 text-center max-w-2xl mx-auto mt-8 leading-relaxed">
        Our coaches are trained peer mentors focused on wellbeing, stress relief, and academic resilience. Professional clinical care guidance is provided whenever specialized support is needed.
      </p>
    </section>
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
