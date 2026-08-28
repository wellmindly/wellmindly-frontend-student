import { toLocalISODate } from './CounselorBookingView';

export interface DateStripProps {
  next7Days: Array<{ iso: string; dayName: string; monthDay: string; fullLabel?: string }>;
  selectedDate: string;
  onSelectDate: (dateIso: string) => void;
}

export function DateStrip({
  next7Days,
  selectedDate,
  onSelectDate,
}: DateStripProps) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-ink-700">
        Choose a date
      </label>
      <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar snap-rail">
        {next7Days.map((day) => {
          const isSelected = selectedDate === day.iso;
          return (
            <button
              key={day.iso}
              type="button"
              onClick={() => {
                onSelectDate(day.iso);
              }}
              aria-pressed={isSelected}
              aria-label={day.fullLabel || `${day.dayName}, ${day.monthDay}`}
              className={`min-w-[44px] min-h-[44px] px-3 py-2 rounded-2xl text-center shrink-0 border transition-all flex flex-col items-center justify-center ${
                isSelected
                  ? 'bg-ink-900 text-ink-50 border-ink-900 shadow-md'
                  : 'bg-paper hover:bg-ink-100 text-ink-700 border-ink-200/80'
              }`}
            >
              <div className="text-2xs font-medium opacity-80">{day.dayName}</div>
              <div className="text-xs font-bold">{day.monthDay}</div>
            </button>
          );
        })}
      </div>

      <div className="pt-1">
        <input
          type="date"
          value={selectedDate}
          min={toLocalISODate(new Date())}
          onChange={(e) => {
            onSelectDate(e.target.value);
          }}
          className="w-full px-3.5 py-2 min-h-[44px] rounded-xl border border-ink-200 text-xs font-medium text-ink-700 focus:outline-none focus:ring-2 focus:ring-plum-500 bg-paper/50"
        />
      </div>
    </div>
  );
}
