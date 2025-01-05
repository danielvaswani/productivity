import type { Transaction } from "@prisma/client";
import PieChart from "~/components/PieChart";
import AddTransaction from "~/components/AddTransaction";
import TransactionCard from "~/components/TransactionCard";

import { useState } from "react";

import { api } from "~/utils/api";

export default function Budgeting() {
  const [isCategoryMode, setIsCategoryMode] = useState(true);
  const transactions = api.transaction.getAll.useQuery();

  const toggleIsCategoryMode = () => setIsCategoryMode(!isCategoryMode);

  const balance =
    transactions.data?.reduce(
      (acc: number, transaction: Transaction) =>
        acc + Number(transaction.value),
      0,
    ) ?? 0.0;

  const income =
    transactions.data
      ?.filter((t: Transaction) => Number(t.value) > 0)
      .reduce(
        (acc: number, transaction: Transaction) =>
          acc + Number(transaction.value),
        0,
      ) ?? 0.0;

  const spent =
    0 -
    Number(
      transactions.data
        ?.filter((t: Transaction) => Number(t.value) < 0)
        .reduce(
          (acc: number, transaction: Transaction) =>
            acc + Number(transaction.value),
          0,
        )
        ?.toFixed(2),
    );

  let pieData: { label: string; value: number }[] =
    transactions.data?.map((transaction: Transaction) => ({
      label: isCategoryMode ? transaction.category : transaction.name,
      value: Number(transaction.value),
    })) ?? [];

  pieData = pieData
    .filter((t) => Number(t.value) < 0)
    .map((t) => ({
      label: t.label,
      value: Math.abs(Number(t.value)),
    }));

  pieData = [
    ...pieData,
    { label: balance < 0 ? "Debt" : "Remaining", value: Math.abs(balance) },
  ];

  return (
    <>
      <div className="container flex flex-col items-center justify-center gap-3 px-4 py-16">
        <PieChart width={500} height={500} data={pieData} />
        <div className="text-5xl">Your Balance</div>
        <div className={`text-4xl ${balance < 0 ? "text-red-500" : ""}`}>
          €{balance.toFixed(2)}
        </div>
        <div className="inline-flex gap-3 text-sm">
          Total Income: €{income}
          {balance < 0 && (
            <div className="text-sm text-red-500">Total Spent: €{spent}</div>
          )}
        </div>
        <label className="swap swap-rotate h-12 rounded border bg-black bg-opacity-30 px-[0.85rem]">
          {/* this hidden checkbox controls the state */}
          <input
            type="checkbox"
            checked={isCategoryMode}
            onClick={toggleIsCategoryMode}
          />

          {/* minus icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="swap-on h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>

          {/* plus icon */}

          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="swap-off h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 12h-15"
            />
          </svg>
        </label>
        <AddTransaction />
        {transactions.data
          ?.sort(
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
