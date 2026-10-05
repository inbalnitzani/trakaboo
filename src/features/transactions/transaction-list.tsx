import type { Transaction } from "@/lib/transactions/types";

import { TransactionRow } from "./transaction-row";

type TransactionListProps = {
  transactions: readonly Transaction[];
};

export function TransactionList({ transactions }: TransactionListProps) {
  return (
    <ul className="grid">
      {transactions.map((transaction) => (
        <li key={transaction.id}>
          <TransactionRow transaction={transaction} />
        </li>
      ))}
    </ul>
  );
}
