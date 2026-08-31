import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";
import logoPng from "../../assets/logo.png";

export interface LogoProps {
  /** md = header (h-8), sm = footer (h-6). */
  size?: "sm" | "md";
  className?: string;
}

export function Logo({ size = "md", className }: LogoProps) {
  return (
    <Link
      to="/"
      className={cn(
        // The image is 24-32px tall, so the link needs its own vertical padding
        // to reach the 44px touch target - otherwise the home link is the one
        // undersized control in the header and the footer.
        "inline-flex min-h-11 items-center rounded-lg transition-opacity hover:opacity-85",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum-400",
        className,
      )}
    >
      <img
        src={logoPng}
        alt="WellMindly home"
        className={cn(
          size === "sm" ? "h-6 w-auto" : "h-8 w-auto",
          "block select-none",
        )}
      />
    </Link>
  );
}
