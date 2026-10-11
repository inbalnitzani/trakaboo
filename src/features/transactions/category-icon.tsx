import { ColorDot } from "@/components/ui/color-dot";
import { categoryColor, getCategory, TINT_BG_CLASS } from "@/config/categories";
import { cn } from "@/lib/utils";

type CategoryIconProps = {
  categoryId: string;
  size?: "sm" | "md";
  className?: string;
};

const SIZE = {
  sm: "size-9",
  md: "size-11",
} as const;

/** The category's color dot on its tint, in an outlined circle. */
export function CategoryIcon({ categoryId, size = "md", className }: CategoryIconProps) {
  const category = getCategory(categoryId);
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full border-2",
        SIZE[size],
        TINT_BG_CLASS[category.tint],
        className,
      )}
    >
      <ColorDot color={categoryColor(category.id)} size={size === "sm" ? "sm" : "md"} />
    </span>
  );
}
