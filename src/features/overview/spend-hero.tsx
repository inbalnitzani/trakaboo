import { useTranslations } from "next-intl";

import { Sticker, type StickerTone } from "@/components/ui/sticker";
import { useFormatters } from "@/i18n/use-formatters";

type SpendHeroProps = {
  total: number;
  /** Percent change vs. last month; null hides the comparison. */
  changePct: number | null;
  /** Average spend per elapsed day. */
  perDay: number;
  /** Number of purchases this month. */
  count: number;
};

const TREND_TONE: Record<"up" | "down" | "same", StickerTone> = {
  up: "peach",
  down: "lime",
  same: "milk",
};

/** The big number at the top of the overview, on a hot pink card with a trend sticker. */
export function SpendHero({ total, changePct, perDay, count }: SpendHeroProps) {
  const t = useTranslations("overview");
  const format = useFormatters();
  const direction = changePct === null || changePct === 0 ? "same" : changePct > 0 ? "up" : "down";

  return (
    <section className="relative mt-3 rounded-[2rem] border-2 bg-primary px-5.5 pt-6 pb-5 text-primary-foreground shadow-pop-lg">
      {changePct !== null && (
        <Sticker tone={TREND_TONE[direction]} className="absolute end-4 -top-4.5">
          {t("vsLastMonth", { direction, percent: Math.abs(changePct) })}
        </Sticker>
      )}
      <h2 className="font-medium">{t("spentThisMonth")}</h2>
      <p className="mt-1.5 font-display text-[4.25rem] leading-none font-bold tracking-[-0.035em] tabular-nums">
        {format.money(Math.round(total))}
      </p>
      <div className="mt-4 flex flex-wrap gap-2 text-sm font-medium">
        <span className="rounded-full border-2 bg-card px-3 py-1">
          {t("avgPerDay", { amount: format.money(Math.round(perDay)) })}
        </span>
        <span className="rounded-full border-2 bg-card px-3 py-1">
          {t("transactionsCount", { count })}
        </span>
      </div>
    </section>
  );
}
