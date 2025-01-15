import { Transaction } from "@prisma/client";
import TransactionCard from "./TransactionCard";

export default function TransactionList({
  transactions,
}: {
  transactions: Transaction[] | [];
}) {
  return (
    <>
      <div className="flex flex-col items-center gap-3 rounded-xl bg-slate-500 bg-opacity-10 p-5 lg:max-h-[460px] lg:overflow-y-scroll">
        <div className="text-2xl font-bold dark:text-white">Transactions</div>
        {transactions
          .sort(
            (a: Transaction, b: Transaction) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .map((transaction: Transaction) => {
            return (
              <div className="w-full" key={transaction.id}>
                <TransactionCard transaction={transaction}></TransactionCard>
              </div>
            );
          })}
      </div>
    </>
  );
}
