import { forwardRef, useId, useState } from "react";
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { cn } from "../../lib/cn";

/* ============================================================================
   Field · Input · Textarea · PasswordInput
   ----------------------------------------------------------------------------
   Fixes that apply to every form in the app:
     · a real visible <label> (placeholder-only labelling disappears on focus)
     · errors sit next to the field AND are wired via aria-describedby
     · aria-invalid so screen readers announce the failure
     · 16px font on mobile, so iOS doesn't zoom the viewport on focus
     · autoComplete passthrough + no paste blocking, so password managers work
   ========================================================================= */

interface FieldShellProps {
  label: string;
  /** Visually hide the label but keep it for assistive tech. Use sparingly. */
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  /** Text shown after the label, e.g. "Optional". */
  suffixLabel?: string;
  children: (ids: { inputId: string; describedBy: string | undefined }) => ReactNode;
  className?: string;
}

export function Field({
  label,
  hideLabel = false,
  hint,
  error,
  required,
  suffixLabel,
  children,
  className,
}: FieldShellProps) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={inputId}
          className={cn(
            "text-sm font-semibold text-ink-800",
            hideLabel && "sr-only",
          )}
        >
          {label}
          {required && (
            <span aria-hidden className="ml-1 text-danger">
              *
            </span>
          )}
          {required && <span className="sr-only"> (required)</span>}
        </label>
        {suffixLabel && !hideLabel && (
          <span className="text-2xs font-medium text-ink-400">{suffixLabel}</span>
        )}
      </div>

      {children({ inputId, describedBy })}

      {hint && !error && (
        <p id={hintId} className="text-xs text-ink-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-xs font-medium text-danger">
          <AlertCircle aria-hidden className="mt-px h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- control shell */

const controlBase = cn(
  "w-full rounded-xl border bg-card text-ink-900",
  "placeholder:text-ink-400",
  "transition-[border-color,box-shadow,background-color] duration-150",
  "focus:outline-none focus-visible:outline-none",
  "focus:border-plum-400 focus:ring-4 focus:ring-plum-500/12",
  "disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-400",
);

const controlValid = "border-ink-200 hover:border-ink-300";
const controlInvalid = "border-danger/60 focus:border-danger focus:ring-danger/12";

/* -------------------------------------------------------------------- Input */

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: string | null;
  /** Decorative icon inside the left edge. */
  icon?: ReactNode;
  /** Control rendered inside the right edge (e.g. a unit, a clear button). */
  trailing?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    hideLabel,
    hint,
    error,
    icon,
    trailing,
    className,
    containerClassName,
    required,
    ...rest
  },
  ref,
) {
  return (
    <Field
      label={label}
      hideLabel={hideLabel}
      hint={hint}
      error={error}
      required={required}
      className={containerClassName}
    >
      {({ inputId, describedBy }) => (
        <div className="relative">
          {icon && (
            <span
              aria-hidden
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 [&>svg]:h-4.5 [&>svg]:w-4.5"
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
            required={required}
            className={cn(
              controlBase,
              error ? controlInvalid : controlValid,
              "h-12 px-4",
              icon && "pl-11",
              trailing && "pr-12",
              className,
            )}
            {...rest}
          />
          {trailing && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</span>
          )}
        </div>
      )}
    </Field>
  );
});

/* ----------------------------------------------------------------- Textarea */

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: string | null;
  /** Shows a live "142 / 500" counter and enforces the limit. */
  maxLength?: number;
  /** Use Lora for long reflective writing. */
  reflective?: boolean;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      label,
      hideLabel,
      hint,
      error,
      maxLength,
      reflective = false,
      className,
      containerClassName,
      required,
      value,
      ...rest
    },
    ref,
  ) {
    const length = typeof value === "string" ? value.length : 0;
    const nearLimit = maxLength ? length > maxLength * 0.9 : false;

    return (
      <Field
        label={label}
        hideLabel={hideLabel}
        hint={hint}
        error={error}
        required={required}
        suffixLabel={maxLength ? `${length} / ${maxLength}` : undefined}
        className={containerClassName}
      >
        {({ inputId, describedBy }) => (
          <div className="relative">
            <textarea
              ref={ref}
              id={inputId}
              value={value}
              maxLength={maxLength}
              aria-describedby={describedBy}
              aria-invalid={error ? true : undefined}
              required={required}
              className={cn(
                controlBase,
                error ? controlInvalid : controlValid,
                "min-h-28 resize-y px-4 py-3 leading-relaxed",
                reflective && "font-reflective text-base leading-[1.75]",
                className,
              )}
              {...rest}
            />
            {maxLength && (
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute bottom-2.5 right-3 rounded-full bg-card/90 px-1.5 text-2xs font-semibold tabular-nums",
                  nearLimit ? "text-warning" : "text-ink-400",
                )}
              >
                {maxLength - length}
              </span>
            )}
          </div>
        )}
      </Field>
    );
  },
);

/* ------------------------------------------------------------ PasswordInput */

export interface PasswordInputProps extends Omit<InputProps, "type" | "trailing"> {
  /** Copy shown under the field the first time, e.g. "At least 8 characters". */
  strengthHint?: string;
}

/**
 * Password field with a reveal toggle. Deliberately does NOT block paste and
 * always forwards autoComplete, so password managers keep working
 * (WCAG 3.3.8 Accessible Authentication).
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ strengthHint, hint, autoComplete = "current-password", ...rest }, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        hint={hint ?? strengthHint}
        trailing={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg text-ink-400",
              "cursor-pointer border-none bg-transparent transition-colors",
              "hover:bg-ink-100 hover:text-ink-700",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
            )}
          >
            {visible ? (
              <EyeOff aria-hidden className="h-4.5 w-4.5" />
            ) : (
              <Eye aria-hidden className="h-4.5 w-4.5" />
            )}
          </button>
        }
        {...rest}
      />
    );
  },
);
