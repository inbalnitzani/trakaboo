import { getCategory, TINT_BG_CLASS } from "@/config/categories";
import { cn } from "@/lib/utils";

type CategoryIconProps = {
  categoryId: string;
  size?: "sm" | "md";
  className?: string;
};

const SIZE = {
  sm: "size-9 rounded-xl text-lg",
  md: "size-11 rounded-2xl text-xl",
} as const;

/** The category's emoji on its pastel tint. */
export function CategoryIcon({ categoryId, size = "md", className }: CategoryIconProps) {
  const category = getCategory(categoryId);
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center",
        SIZE[size],
        TINT_BG_CLASS[category.tint],
        className,
      )}
    >
      {category.emoji}
    </span>
  );
}
