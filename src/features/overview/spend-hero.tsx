import { useTranslations } from "next-intl";

import { useFormatters } from "@/i18n/use-formatters";

type SpendHeroProps = {
  total: number;
  /** Percent change vs. last month; null hides the comparison. */
  changePct: number | null;
};

/** The big number at the top of the overview. */
export function SpendHero({ total, changePct }: SpendHeroProps) {
  const t = useTranslations("overview");
  const format = useFormatters();
  const direction = changePct === null || changePct === 0 ? "same" : changePct > 0 ? "up" : "down";

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] bg-linear-135 from-tint-pink via-tint-lilac to-tint-mint px-5 py-6">
      <span aria-hidden className="absolute -end-2 -top-1.5 rotate-12 text-6xl">
        💸
      </span>
      <h2 className="font-medium text-muted-foreground">{t("spentThisMonth")}</h2>
      <p className="mt-1 mb-3 text-[2.6rem] leading-none font-extrabold tracking-tight tabular-nums">
        {format.money(Math.round(total))}
      </p>
      {changePct !== null && (
        <p className="inline-flex rounded-full bg-white/75 px-3 py-1.5 text-sm font-semibold">
          {t("vsLastMonth", { direction, percent: Math.abs(changePct) })}
        </p>
      )}
    </section>
  );
}
