import { cn } from "@/lib/utils";

export type ChoiceChip<T extends string> = {
  value: T;
  label: string;
  /** Decorative element shown before the label (e.g. a color dot). */
  icon?: React.ReactNode;
};

type ChoiceChipsProps<T extends string> = {
  /** Form field name; the checked chip's value is submitted. */
  name: string;
  options: readonly ChoiceChip<T>[];
  defaultValue?: T;
  /** Accessible name for the group (use `labelledBy` when a visible label exists). */
  label?: string;
  labelledBy?: string;
  invalid?: boolean;
  describedBy?: string;
  className?: string;
};

/**
 * A wrapping set of pill chips backed by native radio inputs, so it works in plain
 * forms (and before hydration) and keeps keyboard arrow navigation for free.
 */
export function ChoiceChips<T extends string>({
  name,
  options,
  defaultValue,
  label,
  labelledBy,
  invalid,
  describedBy,
  className,
}: ChoiceChipsProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-labelledby={labelledBy}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={cn("flex flex-wrap gap-2", className)}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "flex min-h-10 cursor-pointer items-center gap-2 rounded-full border-2 bg-surface px-3.5 py-1.5 text-[0.9375rem] font-medium transition-[background-color,box-shadow,transform] select-none",
            "has-checked:-translate-y-px has-checked:border-foreground has-checked:bg-tint-pink has-checked:shadow-pop-sm",
            "has-focus-visible:ring-3 has-focus-visible:ring-ring/60",
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            defaultChecked={option.value === defaultValue}
            className="sr-only"
          />
          {option.icon}
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
