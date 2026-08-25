import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with correct conflict resolution.
 *
 * Class-attribute order does not decide the winner in CSS - the order of the
 * generated stylesheet does. So `<Button className="px-8" />` would NOT reliably
 * beat the component's internal `px-5` without this. `twMerge` strips the loser.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
