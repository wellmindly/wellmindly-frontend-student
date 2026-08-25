import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { IconButton } from "../ui";

export interface AuthAlertsProps {
  error: string | null;
  success: string | null;
  onClearError?: () => void;
  onClearSuccess?: () => void;
}

export function AuthAlerts({ error, success, onClearError, onClearSuccess }: AuthAlertsProps) {
  return (
    <>
      {/* Always mounted: a live region must exist before its content arrives,
          otherwise the insertion is not announced. */}
      <div aria-live="assertive" aria-atomic="true">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -top-4 left-0 right-0 lg:static lg:mb-6 flex items-start gap-3 rounded-2xl border border-danger/20 bg-danger-soft p-4 text-sm font-medium text-danger shadow-md z-20"
            >
              <AlertCircle className="h-5 w-5 shrink-0 text-danger mt-0.5" aria-hidden="true" />
              <span className="flex-1">{error}</span>
              {onClearError && (
                <IconButton
                  variant="ghost"
                  size="sm"
                  label="Dismiss error"
                  icon={<X className="h-4 w-4" />}
                  onClick={onClearError}
                  className="-mr-1.5 -mt-1.5 text-danger hover:bg-danger/10"
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div aria-live="polite" aria-atomic="true">
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute -top-4 left-0 right-0 lg:static lg:mb-6 flex items-start gap-3 rounded-2xl border border-success/20 bg-success-soft p-4 text-sm font-medium text-success shadow-md z-20"
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 text-success mt-0.5" aria-hidden="true" />
              <span className="flex-1">{success}</span>
              {onClearSuccess && (
                <IconButton
                  variant="ghost"
                  size="sm"
                  label="Dismiss message"
                  icon={<X className="h-4 w-4" />}
                  onClick={onClearSuccess}
                  className="-mr-1.5 -mt-1.5 text-success hover:bg-success/10"
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
