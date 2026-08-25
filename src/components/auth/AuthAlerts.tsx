import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

export interface AuthAlertsProps {
  error: string | null;
  success: string | null;
  onClearError?: () => void;
  onClearSuccess?: () => void;
}

export function AuthAlerts({ error, success, onClearError, onClearSuccess }: AuthAlertsProps) {
  return (
    <>
      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-4 left-0 right-0 lg:static lg:mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 shadow-md z-20"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={onClearError}
              className="rounded-lg p-1 hover:bg-red-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Alert */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-4 left-0 right-0 lg:static lg:mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-md z-20"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
            <span className="flex-1">{success}</span>
            <button
              type="button"
              onClick={onClearSuccess}
              className="rounded-lg p-1 hover:bg-emerald-100 transition-colors cursor-pointer border-none bg-transparent"
            >
              <X className="h-4 w-4 text-emerald-600" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
