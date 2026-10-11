"use client";

import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string> = {
  value: T;
  label: React.ReactNode;
  /** Accessible name when `label` is short or visual-only. */
  ariaLabel?: string;
};

type SegmentedControlProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  /** Accessible name for the group. */
  label: string;
  className?: string;
  disabled?: boolean;
};

/** A pill-shaped single-choice toggle (e.g. language, period). */
export function SegmentedControl<T extends string>({
  options,
  value,
  onValueChange,
  label,
  className,
  disabled,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex gap-1 rounded-full border-2 bg-surface p-1", className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={option.ariaLabel}
            disabled={disabled}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "min-h-9 rounded-full px-3.5 py-1.5 font-display text-sm transition-colors",
              "outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "bg-primary font-semibold text-primary-foreground"
                : "font-medium text-soft-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
