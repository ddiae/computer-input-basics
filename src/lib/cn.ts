import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A utility to merge Tailwind class names with conditional class composition.
 *
 * @example
 * cn('px-4', isActive && 'bg-blue-500', 'text-sm')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
