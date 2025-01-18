import type { Transaction } from "@prisma/client";
import PieChart from "~/components/PieChart";
import AddTransaction from "~/components/AddTransaction";

import { useState } from "react";

import { api } from "~/utils/api";
import TransactionList from "~/components/TransactionList";

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

  const categories = [
    {
      label: "Total Income",
      color: "dark:text-green-100 text-green-500",
      amount: income,
      brackets: true,
    },
    {
      label: "Total Expenses",
      color: "dark:text-red-100 text-red-500",
      brackets: true,
      amount: spent,
    },
    {
      label: "Your Balance",
      color:
        balance < 0
          ? "dark:text-red-600"
          : "dark:text-white text-black font-semibold",
      amount: balance,
    },
  ];

  return (
    <div className="mb-4 flex w-full flex-col items-center justify-evenly gap-12 lg:flex-row">
      <div className="flex w-2/5 flex-col items-center justify-start px-4">
        <div className="-mb-8 text-4xl font-bold lg:ml-4 lg:self-start">
          Budgeting
        </div>
        {transactions.data && transactions.data.length > 0 && (
          <PieChart width={650} height={650} data={pieData} />
        )}
        {transactions.data && transactions.data.length > 0 && (
          <div className="relative -mt-8 flex justify-center gap-4">
            <div className="absolute right-0 top-0 -mt-16">
              <ShowExpenses
                show={isCategoryMode}
                handleToggle={toggleIsCategoryMode}
              />
            </div>
            {categories.map((category, index) => (
              <ReportBox key={index} {...category}></ReportBox>
            ))}
          </div>
        )}
      </div>
      <div className="flex w-full flex-col gap-8 px-6 lg:w-1/2">
        <AddTransaction />
        {transactions.data && transactions.data.length > 0 && (
          <TransactionList transactions={transactions.data} />
        )}
      </div>
    </div>
  );
}

function ShowExpenses({
  show,
  handleToggle,
}: {
  show: boolean;
  handleToggle: React.MouseEventHandler<HTMLInputElement>;
}) {
  return (
    <>
      <label className="swap swap-rotate flex h-12 items-center justify-between gap-2 self-end rounded-lg border bg-black bg-opacity-10 pr-1 text-xs font-bold shadow-xl shadow-black/10">
        {/* this hidden checkbox controls the state */}
        <input type="checkbox" checked={show} onClick={handleToggle} />
        <div className="mb-1 w-[100px] text-center">
          {show ? "Show Expenses" : "Show Categories"}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          className="swap-on -ml-[8px] size-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122"
          />
        </svg>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          className="swap-off -ml-[22px] size-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M8.242 5.992h12m-12 6.003H20.24m-12 5.999h12M4.117 7.495v-3.75H2.99m1.125 3.75H2.99m1.125 0H5.24m-1.92 2.577a1.125 1.125 0 1 1 1.591 1.59l-1.83 1.83h2.16M2.99 15.745h1.125a1.125 1.125 0 0 1 0 2.25H3.74m0-.002h.375a1.125 1.125 0 0 1 0 2.25H2.99"
          />
        </svg>
      </label>
    </>
  );
}

function ReportBox({
  label,
  color,
  amount,
  brackets = false,
}: {
  label: string;
  color: string;
  amount: number;
  brackets?: boolean;
}) {
  return (
    <>
      <div className="flex w-32 flex-col items-center rounded-lg border bg-black bg-opacity-10 p-2">
        <div className="text-md">{label}</div>
        <div className={`text-md ${color}`}>
          {brackets && <span className="opacity-25">{"("}</span>}€
          {amount.toFixed(2)}
          {brackets && <span className="opacity-25">{")"}</span>}
        </div>
      </div>
    </>
  );
}
