import { Clock, Sunrise, Sun, Sunset } from 'lucide-react';
import type { Slot, Counselor } from './types';

export interface SlotGridProps {
  loadingSlots: boolean;
  processedSlotsCount: number;
  timezoneMode: 'utc' | 'local';
  localTzAbbr: string;
  groupedSlots: {
    morning: Slot[];
    afternoon: Slot[];
    evening: Slot[];
  };
  selectedSlot: Slot | null;
  selectedCounselor: Counselor | null;
  onSelectSlot: (slot: Slot) => void;
  formatSlotTimeRange: (startTimeIso: string, endTimeIso: string) => string;
}

export function SlotGrid({
  loadingSlots,
  processedSlotsCount,
  timezoneMode,
  localTzAbbr,
  groupedSlots,
  selectedSlot,
  selectedCounselor,
  onSelectSlot,
  formatSlotTimeRange,
}: SlotGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-ink-700">
          Available time slots ({processedSlotsCount})
        </label>
        <span className="text-2xs text-ink-400">
          {timezoneMode === 'utc' ? '08:00 – 18:00 UTC' : `Converted to ${localTzAbbr}`}
        </span>
      </div>

      {loadingSlots ? (
        <div className="py-8 text-center space-y-2">
          <div className="w-6 h-6 border-2 border-plum-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-ink-400 text-xs">Checking available time slots...</p>
        </div>
      ) : processedSlotsCount === 0 ? (
        <div className="p-6 text-center bg-paper/80 rounded-2xl border border-ink-200/80 space-y-1">
          <Clock className="w-6 h-6 text-ink-400 mx-auto" />
          <p className="text-ink-600 font-medium text-xs">No available slots on this date</p>
          <p className="text-ink-400 text-2xs">Select another date from the bar above.</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
          {/* Morning Block */}
          {groupedSlots.morning.length > 0 && (
            <div className="space-y-2">
              <div className="text-2xs font-semibold text-ink-500 flex items-center space-x-1.5">
                <Sunrise className="w-3.5 h-3.5 text-gold-500" />
                <span>Morning slots</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {groupedSlots.morning.map((slot, i) => {
                  const timeStr = formatSlotTimeRange(slot.startTime, slot.endTime);
                  const isSelected = selectedSlot?.startTime === slot.startTime;
                  const counselorName = slot.counselorName || selectedCounselor?.name;
                  const accessibleLabel = selectedCounselor
                    ? `${timeStr}, 1 hour`
                    : counselorName
                    ? `${timeStr}, 1 hour with ${counselorName}`
                    : `${timeStr}, 1 hour`;

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={!slot.isAvailable}
                      onClick={() => onSelectSlot(slot)}
                      aria-pressed={isSelected}
                      aria-label={accessibleLabel}
                      className={`min-h-[44px] py-2.5 px-3 rounded-xl font-medium text-xs border transition-all flex flex-col justify-center text-left ${
                        !slot.isAvailable
                          ? 'bg-ink-100 text-ink-400 border-ink-200 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-plum-600 text-plum-50 border-plum-600 shadow-md shadow-plum-200'
                          : 'bg-paper/80 hover:bg-plum-50/60 text-ink-800 border-ink-200/80 hover:border-plum-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{timeStr}</span>
                        {!selectedCounselor && slot.availableCount && slot.availableCount > 1 && (
                          <span className={`text-2xs px-1.5 py-0.5 rounded-md ${
                            isSelected ? 'bg-plum-500/20 text-plum-50' : 'bg-plum-50 text-plum-700'
                          }`}>
                            {slot.availableCount} avail
                          </span>
                        )}
                      </div>
                      {!selectedCounselor && slot.counselorName && (
                        <span className={`text-2xs truncate max-w-full mt-0.5 ${
                          isSelected ? 'text-plum-100' : 'text-ink-500'
                        }`}>
                          {slot.counselorName}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Afternoon Block */}
          {groupedSlots.afternoon.length > 0 && (
            <div className="space-y-2">
              <div className="text-2xs font-semibold text-ink-500 flex items-center space-x-1.5">
                <Sun className="w-3.5 h-3.5 text-gold-500" />
                <span>Afternoon slots</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {groupedSlots.afternoon.map((slot, i) => {
                  const timeStr = formatSlotTimeRange(slot.startTime, slot.endTime);
                  const isSelected = selectedSlot?.startTime === slot.startTime;
                  const counselorName = slot.counselorName || selectedCounselor?.name;
                  const accessibleLabel = selectedCounselor
                    ? `${timeStr}, 1 hour`
                    : counselorName
                    ? `${timeStr}, 1 hour with ${counselorName}`
                    : `${timeStr}, 1 hour`;

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={!slot.isAvailable}
                      onClick={() => onSelectSlot(slot)}
                      aria-pressed={isSelected}
                      aria-label={accessibleLabel}
                      className={`min-h-[44px] py-2.5 px-3 rounded-xl font-medium text-xs border transition-all flex flex-col justify-center text-left ${
                        !slot.isAvailable
                          ? 'bg-ink-100 text-ink-400 border-ink-200 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-plum-600 text-plum-50 border-plum-600 shadow-md shadow-plum-200'
                          : 'bg-paper/80 hover:bg-plum-50/60 text-ink-800 border-ink-200/80 hover:border-plum-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{timeStr}</span>
                        {!selectedCounselor && slot.availableCount && slot.availableCount > 1 && (
                          <span className={`text-2xs px-1.5 py-0.5 rounded-md ${
                            isSelected ? 'bg-plum-500/20 text-plum-50' : 'bg-plum-50 text-plum-700'
                          }`}>
                            {slot.availableCount} avail
                          </span>
                        )}
                      </div>
                      {!selectedCounselor && slot.counselorName && (
                        <span className={`text-2xs truncate max-w-full mt-0.5 ${
                          isSelected ? 'text-plum-100' : 'text-ink-500'
                        }`}>
                          {slot.counselorName}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Evening Block */}
          {groupedSlots.evening.length > 0 && (
            <div className="space-y-2">
              <div className="text-2xs font-semibold text-ink-500 flex items-center space-x-1.5">
                <Sunset className="w-3.5 h-3.5 text-plum-400" />
                <span>Evening slots</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {groupedSlots.evening.map((slot, i) => {
                  const timeStr = formatSlotTimeRange(slot.startTime, slot.endTime);
                  const isSelected = selectedSlot?.startTime === slot.startTime;
                  const counselorName = slot.counselorName || selectedCounselor?.name;
                  const accessibleLabel = selectedCounselor
                    ? `${timeStr}, 1 hour`
                    : counselorName
                    ? `${timeStr}, 1 hour with ${counselorName}`
                    : `${timeStr}, 1 hour`;

                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={!slot.isAvailable}
                      onClick={() => onSelectSlot(slot)}
                      aria-pressed={isSelected}
                      aria-label={accessibleLabel}
                      className={`min-h-[44px] py-2.5 px-3 rounded-xl font-medium text-xs border transition-all flex flex-col justify-center text-left ${
                        !slot.isAvailable
                          ? 'bg-ink-100 text-ink-400 border-ink-200 cursor-not-allowed line-through'
                          : isSelected
                          ? 'bg-plum-600 text-plum-50 border-plum-600 shadow-md shadow-plum-200'
                          : 'bg-paper/80 hover:bg-plum-50/60 text-ink-800 border-ink-200/80 hover:border-plum-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{timeStr}</span>
                        {!selectedCounselor && slot.availableCount && slot.availableCount > 1 && (
                          <span className={`text-2xs px-1.5 py-0.5 rounded-md ${
                            isSelected ? 'bg-plum-500/20 text-plum-50' : 'bg-plum-50 text-plum-700'
                          }`}>
                            {slot.availableCount} avail
                          </span>
                        )}
                      </div>
                      {!selectedCounselor && slot.counselorName && (
                        <span className={`text-2xs truncate max-w-full mt-0.5 ${
                          isSelected ? 'text-plum-100' : 'text-ink-500'
                        }`}>
                          {slot.counselorName}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
