import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border-2 border-transparent bg-clip-padding font-display font-semibold whitespace-nowrap transition-[transform,box-shadow,background-color] outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        // Hot pink pill with an ink outline and a flat ink drop that presses down on tap.
        default:
          "border-foreground bg-primary text-primary-foreground shadow-pop active:not-aria-[haspopup]:translate-y-[3px] active:not-aria-[haspopup]:shadow-none",
        outline:
          "border-foreground bg-card text-foreground hover:bg-surface active:not-aria-[haspopup]:translate-y-px aria-expanded:bg-surface",
        secondary:
          "border-foreground bg-secondary text-secondary-foreground active:not-aria-[haspopup]:translate-y-px",
        ghost: "text-foreground hover:bg-muted aria-expanded:bg-muted",
        destructive: "font-sans font-medium text-destructive hover:bg-destructive/10",
        link: "text-accent underline underline-offset-4",
      },
      size: {
        default:
          "h-11 gap-2 px-5 text-base has-data-[icon=inline-end]:pe-4 has-data-[icon=inline-start]:ps-4",
        xs: "h-8 gap-1 px-3 text-sm [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-9 gap-1.5 px-4 text-sm [&_svg:not([class*='size-'])]:size-4",
        lg: "h-13 gap-2 px-6 text-lg has-data-[icon=inline-end]:pe-5 has-data-[icon=inline-start]:ps-5",
        icon: "size-11",
        "icon-xs": "size-8 [&_svg:not([class*='size-'])]:size-4",
        "icon-sm": "size-9 [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-13",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
