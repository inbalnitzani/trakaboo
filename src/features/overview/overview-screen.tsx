import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/ui/empty-state";
import { Notice } from "@/components/ui/notice";
import { SectionCard } from "@/components/ui/section-card";
import { TransactionList } from "@/features/transactions/transaction-list";
import { Link } from "@/i18n/navigation";
import { useFormatters } from "@/i18n/use-formatters";
import type { MonthKey } from "@/lib/dates/dates";
import type { MonthSummary } from "@/lib/transactions/stats";
import type { Transaction } from "@/lib/transactions/types";

import { CategoryCards } from "./category-cards";
import { CategoryDonut } from "./category-donut";
import { DailySpending } from "./daily-spending";
import { MonthComparison } from "./month-comparison";
import { MonthSwitcher } from "./month-switcher";
import { SpendHero } from "./spend-hero";

type OverviewScreenProps = {
  summary: MonthSummary;
  recent: readonly Transaction[];
  /** Latest month that can be navigated to. */
  maxMonth: MonthKey;
  /** Days of the month elapsed so far (for the daily average). */
  activeDays: number;
  isDemo: boolean;
};

export function OverviewScreen({
  summary,
  recent,
  maxMonth,
  activeDays,
  isDemo,
}: OverviewScreenProps) {
  const t = useTranslations("overview");
  const tc = useTranslations("common");
  const tn = useTranslations("nav");
  const format = useFormatters();
  const hasSpend = summary.count > 0;

  return (
    <div className="grid gap-3">
      <h1 className="sr-only">{tn("overview")}</h1>
      {isDemo && <Notice icon="🧪">{tc("demoMode")}</Notice>}
      <MonthSwitcher month={summary.month} maxMonth={maxMonth} pathname="/" />
      <SpendHero total={summary.total} changePct={summary.changePct} />

      {!hasSpend ? (
        <EmptyState icon="🙈" title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <>
          <CategoryCards totals={summary.byCategory} />

          <SectionCard title={t("byCategory")}>
            <CategoryDonut totals={summary.byCategory} />
          </SectionCard>

          <SectionCard
            title={t("daily")}
            aside={t("avgPerDay", { amount: format.money(Math.round(summary.total / activeDays)) })}
          >
            <DailySpending
              month={summary.month}
              daily={summary.daily}
              counts={summary.dailyCounts}
            />
          </SectionCard>

          {summary.previousTotal > 0 && (
            <SectionCard title={t("comparison")}>
              <MonthComparison rows={summary.comparison} />
            </SectionCard>
          )}

          <SectionCard
            title={t("recent")}
            aside={
              <Link href="/transactions" className="font-medium text-accent">
                {t("seeAll")}
              </Link>
            }
          >
            <TransactionList transactions={recent} />
          </SectionCard>
        </>
      )}
    </div>
  );
}
