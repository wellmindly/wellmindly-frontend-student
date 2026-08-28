import { motion } from 'framer-motion';
import { Check, Star, Info } from 'lucide-react';
import { IconButton } from '../ui/Button';
import type { Counselor } from './types';

export interface CounselorCardProps {
  counselor: Counselor;
  isSelected: boolean;
  onSelect: (counselor: Counselor) => void;
  onOpenBio: (counselor: Counselor) => void;
}

export function CounselorCard({
  counselor,
  isSelected,
  onSelect,
  onOpenBio,
}: CounselorCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative group"
    >
      <div className="absolute top-4 right-4 z-10">
        <IconButton
          label="About this counselor"
          size="sm"
          variant="ghost"
          icon={<Info className="w-4 h-4 text-ink-400 hover:text-ink-700" />}
          onClick={() => onOpenBio(counselor)}
        />
      </div>

      <button
        type="button"
        onClick={() => onSelect(counselor)}
        aria-pressed={isSelected}
        className={`w-full text-left bg-card rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between space-y-5 ${
          isSelected
            ? 'border-plum-600 ring-2 ring-plum-500/30 bg-gradient-to-b from-plum-50/30 to-card shadow-xl shadow-plum-100/50'
            : 'border-ink-200/90 hover:border-plum-300 hover:shadow-lg hover:-translate-y-0.5'
        }`}
      >
        {/* Top Profile Header */}
        <div className="space-y-4 w-full">
          <div className="flex items-start space-x-3.5 pr-10">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-plum-500 to-plum-600 text-plum-50 font-bold text-xl flex items-center justify-center shadow-md overflow-hidden ring-2 ring-card">
                {counselor.avatarUrl ? (
                  <img
                    src={counselor.avatarUrl}
                    alt={counselor.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  counselor.name[0]
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-ink-900 text-base group-hover:text-plum-600 transition-colors truncate">
                {counselor.name}
              </h3>

              <p className="text-ink-500 text-xs font-medium truncate mt-0.5">
                {counselor.credentials}
              </p>

              {counselor.totalReviews > 0 ? (
                <div className="flex items-center space-x-1 mt-1 text-gold-500 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-gold-400" />
                  <span>{counselor.averageRating}</span>
                  <span className="text-ink-400 font-normal">
                    ({counselor.totalReviews} {counselor.totalReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              ) : (
                <p className="text-xs text-ink-500 font-medium mt-1">No reviews yet</p>
              )}
            </div>
          </div>

          {/* Specializations Badges */}
          <div className="flex flex-wrap gap-1.5">
            {counselor.specializations.map((spec, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-ink-100/90 text-ink-700 rounded-lg text-2xs font-medium border border-ink-200/50"
              >
                {spec}
              </span>
            ))}
          </div>

          {/* Bio Text */}
          <p className="text-ink-600 text-xs leading-relaxed line-clamp-3">
            {counselor.bio}
          </p>
        </div>

        {/* Selected indicator inside card button */}
        {isSelected && (
          <div className="pt-2 flex items-center space-x-1.5 text-xs font-bold text-plum-700">
            <Check className="w-4 h-4 stroke-[3] text-plum-600" aria-hidden="true" />
            <span>Selected</span>
          </div>
        )}
      </button>
    </motion.div>
  );
}
