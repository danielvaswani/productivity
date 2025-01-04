import { Transaction } from "@prisma/client";
import Head from "next/head";
import PieChart from "~/components/PieChart";
import AddTransaction from "~/components/AddTransaction";
import { api } from "~/utils/api";
import TransactionCard from "~/components/TransactionCard";

export default function Budgeting() {
  const transactions = api.transaction.getAll.useQuery();

  const balance = transactions.data?.reduce(
    (acc: number, transaction: Transaction) => acc + Number(transaction.value),
    0,
  );

  let pieData =
    transactions.data?.map((transaction: Transaction) => ({
      category: transaction.category,
      value: Number(transaction.value),
    })) ?? [];

  pieData = [
    ...pieData,
    { category: balance! < 0 ? "Debt" : "Remaining", value: balance },
  ]
    .filter((t) => t.category !== "Income")
    .map((t) => ({ category: t.category, value: Math.abs(t.value!) }));

  return (
    <>
      <div className="container flex flex-col items-center justify-center gap-3 bg-gray-800 px-4 py-16">
        <PieChart width={500} height={500} transactions={pieData} />
        <div className="text-5xl">Your Balance</div>
        <div className="text-4xl">€{balance?.toFixed(2)}</div>
        {balance! < 0 && (
          <div className="text-sm">
            Total Income: €
            {transactions.data
              ?.filter((t: Transaction) => t.category === "Income")
              .reduce(
                (acc: number, transaction: Transaction) =>
                  acc + Number(transaction.value),
                0,
              )
              ?.toFixed(2)}
          </div>
        )}

        <AddTransaction />
        {transactions.data
          ?.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .map((transaction) => {
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
