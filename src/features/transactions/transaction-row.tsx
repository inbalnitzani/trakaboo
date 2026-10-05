import { useTranslations } from "next-intl";

import { getCategory } from "@/config/categories";
import { useFormatters } from "@/i18n/use-formatters";
import type { Transaction } from "@/lib/transactions/types";

import { CategoryIcon } from "./category-icon";
import { SourceBadge } from "./source-badge";

type TransactionRowProps = {
  transaction: Transaction;
};

export function TransactionRow({ transaction }: TransactionRowProps) {
  const t = useTranslations("categories");
  const format = useFormatters();
  const category = getCategory(transaction.categoryId);

  return (
    <div className="flex items-center gap-3 rounded-2xl px-1.5 py-2.5">
      <CategoryIcon categoryId={category.id} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{transaction.merchant}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{t(category.id)}</span>
          <SourceBadge source={transaction.source} />
        </p>
      </div>
      <span className="font-bold tabular-nums" dir="ltr">
        {format.money(-transaction.amount, 2)}
      </span>
    </div>
  );
}
