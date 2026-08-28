import { Star } from 'lucide-react';
import { Sheet } from '../ui/Sheet';
import type { Counselor } from './types';

export interface CounselorBioModalProps {
  bioModalCounselor: Counselor | null;
  onClose: () => void;
  onSelectCounselor: (counselor: Counselor) => void;
}

export function CounselorBioModal({
  bioModalCounselor,
  onClose,
  onSelectCounselor,
}: CounselorBioModalProps) {
  return (
    <Sheet
      open={bioModalCounselor !== null}
      onClose={onClose}
      title={bioModalCounselor?.name ?? ''}
      size="md"
    >
      {bioModalCounselor && (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-plum-500 to-plum-600 text-plum-50 font-bold text-2xl flex items-center justify-center shadow-md overflow-hidden shrink-0">
              {bioModalCounselor.avatarUrl ? (
                <img src={bioModalCounselor.avatarUrl} alt={bioModalCounselor.name} className="w-full h-full object-cover" />
              ) : (
                bioModalCounselor.name[0]
              )}
            </div>
            <div>
              <p className="text-plum-600 text-xs font-semibold">{bioModalCounselor.credentials}</p>
              {bioModalCounselor.totalReviews > 0 ? (
                <div className="flex items-center space-x-1 mt-1 text-gold-500 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-gold-400" />
                  <span>{bioModalCounselor.averageRating}</span>
                  <span className="text-ink-400 font-normal">
                    ({bioModalCounselor.totalReviews} {bioModalCounselor.totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              ) : (
                <p className="text-xs text-ink-500 font-medium mt-1">No reviews yet</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-ink-500 uppercase tracking-wider">Clinical Background & Bio</h4>
            <p className="text-ink-700 text-sm leading-relaxed whitespace-pre-line bg-paper p-4 rounded-2xl border border-ink-100">
              {bioModalCounselor.bio}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-ink-500 uppercase tracking-wider">Areas of Expertise</h4>
            <div className="flex flex-wrap gap-1.5">
              {bioModalCounselor.specializations.map((spec, i) => (
                <span key={i} className="px-3 py-1 bg-plum-50 text-plum-700 rounded-lg text-xs font-semibold border border-plum-100">
                  {spec}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-ink-100 hover:bg-ink-200 text-ink-700 font-bold rounded-2xl text-xs transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectCounselor(bioModalCounselor);
                onClose();
              }}
              className="flex-1 py-3 bg-plum-600 hover:bg-plum-700 text-plum-50 font-bold rounded-2xl text-xs shadow-lg shadow-plum-200 transition-colors"
            >
              Select This Counselor
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
