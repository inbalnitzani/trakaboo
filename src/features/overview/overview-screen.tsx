import { useTranslations } from "next-intl";

import { EmptyState } from "@/components/ui/empty-state";
import { LogoMark } from "@/components/ui/logo-mark";
import { Notice } from "@/components/ui/notice";
import { SectionCard } from "@/components/ui/section-card";
import { TransactionList } from "@/features/transactions/transaction-list";
import { Link } from "@/i18n/navigation";
import type { MonthKey } from "@/lib/dates/dates";
import type { MonthSummary } from "@/lib/transactions/stats";
import type { Transaction } from "@/lib/transactions/types";

import { CategoryShare } from "./category-share";
import { CategoryTiles } from "./category-tiles";
import { DailySpending } from "./daily-spending";
import { MonthSwitcher } from "./month-switcher";
import { SpendHero } from "./spend-hero";

type OverviewScreenProps = {
  summary: MonthSummary;
  recent: readonly Transaction[];
  /** Latest month that can be navigated to. */
  maxMonth: MonthKey;
  /** Days of the month elapsed so far (for the daily average). */
  activeDays: number;
  /** Index of today in `summary.daily` when showing the current month. */
  todayIndex?: number;
  isDemo: boolean;
};

export function OverviewScreen({
  summary,
  recent,
  maxMonth,
  activeDays,
  todayIndex,
  isDemo,
}: OverviewScreenProps) {
  const t = useTranslations("overview");
  const tc = useTranslations("common");
  const tn = useTranslations("nav");
  const hasSpend = summary.count > 0;
  const perDay = summary.total / activeDays;
  const hasPrevious = summary.previousTotal > 0;

  return (
    <div className="grid gap-6">
      <h1 className="sr-only">{tn("overview")}</h1>
      {isDemo && <Notice icon="✦">{tc("demoMode")}</Notice>}
      <MonthSwitcher month={summary.month} maxMonth={maxMonth} pathname="/" />
      <SpendHero
        total={summary.total}
        changePct={summary.changePct}
        perDay={perDay}
        count={summary.count}
      />

      {!hasSpend ? (
        <EmptyState
          icon={<LogoMark size="lg" />}
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      ) : (
        <>
          <SectionCard
            variant="plain"
            title={t("whereItWent")}
            aside={hasPrevious ? t("comparison") : undefined}
          >
            <div className="grid gap-3.5">
              <CategoryShare totals={summary.byCategory} />
              <CategoryTiles
                totals={summary.byCategory}
                comparison={hasPrevious ? summary.comparison : undefined}
              />
            </div>
          </SectionCard>

          <SectionCard title={t("daily")}>
            <DailySpending
              month={summary.month}
              daily={summary.daily}
              counts={summary.dailyCounts}
              todayIndex={todayIndex}
              average={perDay}
            />
          </SectionCard>

          <SectionCard
            variant="plain"
            title={t("recent")}
            aside={
              <Link
                href="/transactions"
                className="font-display text-base font-semibold text-accent underline underline-offset-4"
              >
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
