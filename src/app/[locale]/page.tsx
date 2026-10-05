import { getTransactionsRepository, isDemoMode } from "@/data/repository";
import { OverviewScreen } from "@/features/overview/overview-screen";
import { initLocale } from "@/i18n/server";
import {
  dayOfMonth,
  daysInMonth,
  isMonthKey,
  monthRange,
  shiftMonth,
  todayIso,
  toMonthKey,
} from "@/lib/dates/dates";
import { summarizeMonth } from "@/lib/transactions/stats";

const RECENT_COUNT = 5;

export default async function OverviewPage({ params, searchParams }: PageProps<"/[locale]">) {
  initLocale((await params).locale);

  const today = todayIso();
  const currentMonth = toMonthKey(today);
  const requested = (await searchParams).month;
  const month =
    typeof requested === "string" && isMonthKey(requested) && requested <= currentMonth
      ? requested
      : currentMonth;

  // One query covers this month and the previous one (for the comparison).
  const transactions = await getTransactionsRepository().listBetween({
    from: monthRange(shiftMonth(month, -1)).from,
    to: monthRange(month).to,
  });

  const summary = summarizeMonth(transactions, month);
  const recent = transactions.filter((t) => t.date.startsWith(month)).slice(0, RECENT_COUNT);

  return (
    <OverviewScreen
      summary={summary}
      recent={recent}
      maxMonth={currentMonth}
      activeDays={month === currentMonth ? dayOfMonth(today) : daysInMonth(month)}
      isDemo={isDemoMode()}
    />
  );
}
