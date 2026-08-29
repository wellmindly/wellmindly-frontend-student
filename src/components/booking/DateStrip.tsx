import { cn } from "../../lib/cn";
import { dayKey } from "../../lib/format";

export interface DateStripProps {
  next7Days: Array<{ iso: string; dayName: string; monthDay: string; fullLabel?: string }>;
  selectedDate: string;
  onSelectDate: (dateIso: string) => void;
}

/**
 * Seven days as a snap rail plus a date input for anything further out. The
 * buttons are a fixed width rather than content-width so the rail scrolls in
 * even steps and never leaves half a day showing at the edge.
 */
export function DateStrip({ next7Days, selectedDate, onSelectDate }: DateStripProps) {
  return (
    <div className="space-y-2">
      <span className="block text-xs font-semibold text-ink-700" id="date-strip-label">
        Date
      </span>

      <div
        role="group"
        aria-labelledby="date-strip-label"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar snap-rail"
      >
        {next7Days.map((day) => {
          const isSelected = selectedDate === day.iso;
          return (
            <button
              key={day.iso}
              type="button"
              onClick={() => onSelectDate(day.iso)}
              aria-pressed={isSelected}
              aria-label={day.fullLabel || `${day.dayName}, ${day.monthDay}`}
              className={cn(
                "flex min-h-14 w-[4.75rem] shrink-0 flex-col items-center justify-center rounded-2xl border",
                "text-center transition-colors cursor-pointer",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
                isSelected
                  ? "border-ink-900 bg-ink-900 text-ink-50 shadow-sm"
                  : "border-ink-200/80 bg-card text-ink-700 hover:border-ink-300 hover:bg-paper",
              )}
            >
              <span className="text-2xs font-medium opacity-80">{day.dayName}</span>
              <span className="text-xs font-bold">{day.monthDay}</span>
            </button>
          );
        })}
      </div>

      <label className="block">
        <span className="sr-only">Or pick another date</span>
        <input
          type="date"
          value={selectedDate}
          min={dayKey(new Date())}
          onChange={(e) => {
            if (e.target.value) onSelectDate(e.target.value);
          }}
          className={cn(
            "min-h-11 w-full rounded-xl border border-ink-200 bg-paper px-3.5 text-xs font-medium text-ink-700",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
          )}
        />
      </label>
    </div>
  );
}
